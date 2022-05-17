"""
Views for nlm_fb human baseline experiment.

-----

"""
import os
import json
import random
import requests

import pandas as pd
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.utils import timezone as tz
from django.conf import settings
from django.contrib.auth.decorators import user_passes_test
import boto3

from nlm_fb.nlm_fb_expt.models import (Participant, AttentionCheckTrial,
                                       CriticalTrial)
from nlm_fb.data.expt.words import wordlist
from nlm_fb.secrets import AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

"""
Parameters
----------
"""

# General parameters
MODULE_PATH = "nlm_fb/nlm_fb_expt"
MODULE_URL = "nlm_fb"
RESULTS_DIR = "nlm_fb/data/results/"  # Store responses

RECAPTCHA_URL = "https://www.google.com/recaptcha/api/siteverify"

MODELS = {
    "participant": Participant,
    "critical": CriticalTrial,
    "attention_check": AttentionCheckTrial
}


"""
Utils
"""


def generate_key():
    """Generate ppt key."""
    return random.choice(wordlist)


"""
Load stimuli
"""


def load_item(item_id):
    """Load data for a specific item.

    Args:
        item_id (str): Item id for item

    Returns:
        item_data (dict): passage, critical, & attn check q's

    Raises:
        ValueError: Description
    """
    stimuli = pd.read_csv("nlm_fb/data/expt/nlm_fb_stimuli.csv")
    row = stimuli[stimuli["item_id"] == item_id]

    if len(row) != 1:
        raise ValueError(f"item_id: '{item_id}' is invalid")
        # TODO: Generate random id if id doesn't match
        # Log error etc
    else:
        row = row.iloc[0]

    # Assemble data needed for expt
    item_data = {
        # Item data
        "item_id": item_id,
        "item": int(row["item"]),
        "condition": row["condition"],
        "first_mention": row["first_mention"],
        "recent_mention": row["recent_mention"],
        "knowledge_cue": row["knowledge_cue"],
        "start": row["start"],
        "end": row["end"],

        # Passage
        "passage": row["passage_hr"],

        # Critical q
        "critical_q": row["critical_q"],
        "critical_a": row["critical_a"],

        # Attn q's
        "attn_check_1_q": row["attn_check_1_q"],
        "attn_check_1_a": row["attn_check_1_a"],
        "attn_check_2_q": row["attn_check_2_q"],
        "attn_check_2_a": row["attn_check_2_a"]
    }

    return item_data


"""
Run Experiment
--------------
"""


def get_ip_address(request):
    """Get the IP Address from request."""
    # Get IP Address
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip_address = x_forwarded_for.split(',')[0]
    else:
        ip_address = request.META.get('REMOTE_ADDR', "")

    return ip_address


def init_ppt(request):
    """Create new ppt."""
    get_args = str(request.GET)
    get_args += str(request.POST)

    ip_address = get_ip_address(request)

    study = request.GET.get("study", "")

    # Create key
    key = generate_key()

    # Create DB object
    ppt = Participant.objects.create(
        ip_address=ip_address, key=key,
        get_args=get_args, study=study)

    return ppt


def expt(request):
    """Return experiment view.

    GET Args:
        {item_id}: id of item
    """
    # Create ppt
    ppt = init_ppt(request)

    # Get experimental items
    item_id = request.GET.get("item_id")
    item_data = load_item(item_id)

    # Create view context
    conf = {"ppt_id": ppt.id, "key": ppt.key}
    context = {"item_data": item_data, "conf": conf}

    # Return view
    return render(request, MODULE_URL + '/expt.html', context)


def error(request):
    """Error page."""
    return render(request, MODULE_URL + '/error.html')


def ua_data(request):
    """Store ppt ua_data.

    We do this asynchronously so we can get the fullscreen size
    """
    post = json.loads(request.body.decode('utf-8'))

    ppt_id = post['ppt_id']

    ppt = Participant.objects.get(pk=ppt_id)
    ppt.notes = ppt.notes + str(post)
    ppt.ua_header = post.get('ua_header', "")
    ppt.screen_width = post.get('width', "")
    ppt.screen_height = post.get('height', "")
    ppt.worker_id = post.get('worker_id', "")
    ppt.assignment_id = post.get('assignment_id', "")
    ppt.save()

    return JsonResponse({"success": True})


def validate_captcha(request):
    """Validate captcha token."""
    post = json.loads(request.body.decode('utf-8'))

    ppt_id = post['ppt_id']
    token = post.get('token')

    data = {"response": token,
            "secret": settings.CAPTCHA_SECRET_KEY}

    response = requests.post(RECAPTCHA_URL, data=data)

    content = response.content

    response_data = json.loads(content)

    score = response_data.get('score')
    ppt = Participant.objects.get(pk=ppt_id)
    ppt.captcha_score = score
    ppt.save()

    return JsonResponse(response_data)


"""
Store Data
----------
"""


def save_json_results(data):
    """Save raw json results as a backup in case something goes wrong..."""
    # Generate filename
    timestamp = tz.now().strftime("%Y-%m-%d-%H-%M-%S")
    ppt_id = data.get('ppt_id')
    filename = f"{timestamp}-{ppt_id}.json"
    filepath = os.path.join(RESULTS_DIR, filename)

    # Ensure RESULTS_DIR exists
    if not os.path.isdir(RESULTS_DIR):
        os.mkdir(RESULTS_DIR)

    # Write file
    with open(filepath, 'w') as file:
        json.dump(data, file, indent=4)

    return True


def store_nlm_fb_results(data, ppt):
    """Store results from nlmfb trials."""
    passage = [item for item in data
               if item.get('trial_part') == "passage"][0]
    critical = [item for item in data
                if item.get("item_type") == "critical"][0]

    CriticalTrial.objects.create(
        # Scale & ppt
        participant=ppt,

        # Item identifier
        item_id=critical.get('item_id'),  # uid
        item=critical.get('item'),  # story id
        item_type=critical.get('item_type'),  # critical/practice
        trial_index=critical.get('trial_index'),
        condition=critical.get('condition'),
        first_mention=critical.get("first_mention"),
        recent_mention=critical.get('recent_mention'),
        knowledge_cue=critical.get('knowledge_cue'),
        start=critical.get('start'),
        end=critical.get('end'),

        # Response info
        response=critical.get('response'),
        reaction_time=critical.get('rt'),
        correct_answer=critical.get('correct_answer'),
        is_correct=critical.get('is_correct'),
        is_start=critical.get('is_start'),
        is_end=critical.get('is_end'),
        passage_reading_time=passage.get("rt")
    )

    attn_checks = [item for item in data
                   if item.get("item_type") == "attention_check"]

    for attn_check in attn_checks:

        AttentionCheckTrial.objects.create(
            # Scale & ppt
            participant=ppt,

            # Item identifier
            item_id=attn_check.get('item_id'),  # uid
            question_id=attn_check.get('question_id'),  # question type
            item=attn_check.get('item'),  # story id
            item_type=attn_check.get('item_type'),  # critical/practice
            trial_index=attn_check.get('trial_index'),

            # Response info
            response=attn_check.get('response'),
            reaction_time=attn_check.get('rt'),
            correct_answer=attn_check.get('correct_answer'),
            is_correct=attn_check.get('is_correct')
        )


def store_demographics(data, ppt):
    """Store demographics information."""
    demo = [item for item in data if item.get('trial_part') == "demographics"]

    demo = demo[0]
    demo_data = json.loads(demo.get('responses', "{}"))
    ppt.birth_year = demo_data.get('demographics_year') or None
    ppt.gender = demo_data.get('demographics_gender')
    ppt.native_english = demo_data.get('demographics_english') == "yes"
    ppt.dyslexia = demo_data.get('dyslexia') == "true"
    ppt.adhd = demo_data.get('adhd') == "true"
    ppt.asd = demo_data.get('asd') == "true"
    ppt.vision = demo_data.get('demographics_vision', "")
    ppt.vision_reason = demo_data.get('demographics_vision_reason', "")

    ppt.save()


def store_debrief(data, ppt):
    """Store debrief information."""
    debrief = filter(lambda x: x.get('trial_part') == "post_test", data)

    for debrief_item in debrief:
        debrief_data = json.loads(debrief_item.get('responses', "{}"))
        for name, response in debrief_data.items():
            setattr(ppt, name, response)

    ppt.save()


def update_mturk(ppt):
    """Grant qualification to worker to prevent future HITs."""
    client = boto3.client(
        'mturk',
        region_name="us-east-1",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )

    # try:
    #     # Approve assignment
    #     approve_response = client.approve_assignment(
    #         AssignmentId=ppt.assignment_id,
    #         RequesterFeedback='Thanks again for your help',
    #         OverrideRejection=False
    #     )

    #     approve_status = approve_response["ResponseMetadata"]["HTTPStatusCode"]

    #     ppt.notes = ppt.notes + str(approve_response) + "\n"

    # except Exception as e:
    #     approve_status = "Error"
    #     ppt.notes = ppt.notes + str(e) + "\n"

    try:
        # Block future HITs
        block_response = client.associate_qualification_with_worker(
            QualificationTypeId='3GNL8ZDCG6N1PUOYDZQY9HUQXUMIOJ',
            WorkerId=ppt.worker_id,
            IntegerValue=1,
            SendNotification=False
        )

        block_status = block_response["ResponseMetadata"]["HTTPStatusCode"]
        ppt.notes = ppt.notes + str(block_response) + "\n"

    except Exception as e:
        block_status = "Error"
        ppt.notes = ppt.notes + str(e) + "\n"

    ppt.save()

    success = True if block_status == 200 else False

    return success


def save_results(request):
    """Save results to db."""
    # Get posted data
    post = json.loads(request.body.decode('utf-8'))

    # Save raw json
    save_json_results(post)

    # Retreieve ppt
    ppt_id = post.get('ppt_id')
    ppt = Participant.objects.get(pk=ppt_id)

    # store results
    data = post['results']
    store_nlm_fb_results(data, ppt)
    store_demographics(data, ppt)
    store_debrief(data, ppt)

    ppt.end_time = tz.now()
    ppt.save()

    # Ppt is mturk worker
    if ppt.worker_id or ppt.assignment_id:
        success = update_mturk(ppt)
    else:
        success = True

    status = {"success": success}

    # Notify User
    return JsonResponse(status)


"""
Download Data
-------------
"""


def is_admin(user):
    """Check if user is an admin."""
    return user.is_superuser


def get_model_data(model_name):
    """Get data on all trials."""
    model = MODELS[model_name]

    data_list = []
    for record in model.objects.all():

        data = record.__dict__
        data.pop('_state')

        data_list.append(data)

    df = pd.DataFrame(data_list)
    df = df.sort_values('id').reset_index(drop=True)
    return df


@user_passes_test(is_admin)
def download_data(request, model):
    """Download csv of model data."""
    data = get_model_data(model)

    fname = f'{MODULE_URL}_{model}_{tz.now():%Y-%m-%d-%H-%M-%S}.csv'

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{fname}"'

    data.to_csv(response, index=False)

    return response
