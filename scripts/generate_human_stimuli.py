"""Generate Human readable versions of nlm stimuli."""

import re

import pandas as pd

# Load stimuli
stimuli = pd.read_csv("nlm_fb/data/nlm_fb_stimuli.csv")

# Initialize some lists to store our new data
passage_hr = []
critical_q = []
critical_a = []

for (ix, row) in stimuli.iterrows():
    # Grab passage from row
    passage = row["passage"]
    sentence_split = passage.split(".")

    # Get and rejoin passage sentences before critical sentence
    passage_sents = sentence_split[:-2]
    passage_proper = ".".join(passage_sents) + "."
    passage_hr.append(passage_proper)

    # Get critical sentence and remove [MASK]
    critical_sent = sentence_split[-2]
    critical_sent = re.sub("\[MASK\]", "", critical_sent)  # remove MASK
    critical_sent = critical_sent.strip()  # remove trailing whitespace
    critical_q.append(critical_sent)

    # Get correct answer for critical
    if row["condition"] == "True Belief":
        correct_answer = row["end"]
    else:
        correct_answer = row["start"]
    critical_a.append(correct_answer)

stimuli["passage_hr"] = passage_hr
stimuli["critical_q"] = critical_q
stimuli["critical_a"] = critical_a

stimuli.to_csv("nlm_fb/data/nlm_fb_stimuli.csv")
