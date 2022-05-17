# Can NLMs explain the effect of false belief on human comprehenders?

## Overview

Analysis and experiment code for a study exploring the extent to which differences in NLM surprisal explain variance in human responses to a false belief task.

## GPT-3 Surprisal

The code to elicit predictions from GPT-3 for each stimulus is contained in `/src/models/run_gpt3.py`. In order to run this code you will need to add an `src/models/gpt3_key.txt` file with an OpenAI API Key.

## Behavioral Experiment

The experiment code is contained in `nlm_fb_expt/` and uses the python Django framework. In order to run the experiment you will need to install [Django](https://www.djangoproject.com/), include `nlm_fb.nlm_fb_expt` in `INSTALLED_APPS`,
and include `nlm_fb.nlm_fb_expt.urls` in the project's `urlpatterns`.

## Stastical Analysis

Cleaned data from the experiment is contained in `data/clean`. R code to analyse the data is contained in `stats/`.

