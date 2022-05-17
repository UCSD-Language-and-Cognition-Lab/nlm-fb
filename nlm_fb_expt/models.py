"""Database models for nlm-fb project."""

from django.db import models


class Participant(models.Model):
    """Class to store participant data."""

    # Identify ppt
    ip_address = models.TextField()
    worker_id = models.TextField(default="")  # Amazon Mechanical Turk Worker Id
    assignment_id = models.TextField(default="")  # MTurk Assignment Id
    get_args = models.TextField(default="")  # Get args issued with request
    notes = models.TextField(default="")  # Miscellaneous notes
    key = models.CharField(max_length=80)  # Key for granting credit
    study = models.CharField(max_length=80)  # Pilot? Test? Main?

    # Device
    ua_header = models.TextField(default="")
    screen_width = models.TextField(default="")
    screen_height = models.TextField(default="")

    # Validation
    captcha_score = models.FloatField(blank=True, null=True)

    # Experiment
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)

    # Demographics
    birth_year = models.IntegerField(blank=True, null=True)
    gender = models.CharField(blank=True, null=True, max_length=2)
    native_english = models.BooleanField(blank=True, null=True)
    dyslexia = models.BooleanField(blank=True, null=True)
    adhd = models.BooleanField(blank=True, null=True)
    asd = models.BooleanField(blank=True, null=True)
    vision = models.CharField(blank=True, null=True, max_length=10)
    vision_reason = models.TextField(default="")

    # Feedback
    post_test_purpose = models.TextField(default="")
    post_test_other = models.TextField(default="")


class Trial(models.Model):
    """Responses to nlm_fb trial questions."""

    participant = models.ForeignKey(
        Participant,
        on_delete=models.CASCADE
    )

    # Item identifier
    item_id = models.CharField(max_length=80)  # Unique item ID
    item = models.IntegerField()  # Item Template Id
    item_type = models.CharField(  # critical/attention_check
        max_length=80)
    trial_index = models.IntegerField()  # Index for ppt

    # Response info
    correct_answer = models.TextField(blank=True, default="")  # Correct answer
    response = models.TextField(blank=True, default="")  # Ppt response
    is_correct = models.BooleanField(blank=True, null=True)
    reaction_time = models.FloatField()  # RT in ms


class AttentionCheckTrial(Trial):
    """Responses to attention check questions."""

    item_type = "attention_check"
    question_id = models.CharField(max_length=80)  # Attn question type


class CriticalTrial(Trial):
    """Responses to critical questions."""

    # Item data
    item_type = "critical"
    condition = models.CharField(max_length=80)  # T/F Belief
    first_mention = models.CharField(max_length=80)
    recent_mention = models.CharField(max_length=80)
    knowledge_cue = models.CharField(max_length=80)
    start = models.CharField(max_length=80)
    end = models.CharField(max_length=80)

    # Response data
    is_start = models.BooleanField(blank=True, null=True)
    is_end = models.BooleanField(blank=True, null=True)
    passage_reading_time = models.FloatField()  # RT in ms
