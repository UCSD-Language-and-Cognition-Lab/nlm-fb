
# Variables
date.start <- "2022-04-06 00:00:00"
date.end <- "2022-04-08 00:00:00"

# Load data
ppts.raw <- read.csv("../data/clean/nlm_fb_participants_clean.csv")
critical <- read.csv("../data/clean/nlm_fb_critical_clean.csv")
attention <- read.csv("../data/clean/nlm_fb_attention_clean.csv")
df_fb_gpt3_dv = read.csv("../data/processed/fb_gpt3-text-davinci-002_surprisals_probs.csv")

# Preprocess data
ppts.all <- preprocess.ppts(
  ppts.raw, date.start, date.end, sona=F, ip=F, study=1)


# Exclude participants
ppts.all <- exclude.ppts(ppts.all, native.eng=T, max.runtime=600)

ppts <- ppts.all %>% filter(excluded == F)

critical <- critical %>%
  filter(participant_id %in% ppts$id)

attention <- attention %>%
  filter(participant_id %in% ppts$id)

# Correct responses

attention <- attention %>% 
  merge(critical %>% select(item_id, start, end) %>% group_by(item_id) %>% summarize(start=first(start), end=first(end))) %>%
  mutate(
    response = tolower(response),  # Lower
    response = trimws(response),  # Strip whitespace
    response = gsub('[[:punct:]]+','',response),  # Remove punctuation
    response = gsub('the ','',response),  # Remove the
    is_correct = response == correct_answer,
    is_start = response == start,
    is_end = response == end,
    is_start_or_end = is_start | is_end
  )

critical <- critical %>% 
  mutate(
    response = tolower(response),  # Lower
    response = trimws(response),  # Strip whitespace
    response = gsub('[[:punct:]]+','',response),  # Remove punctuation
    response = gsub('the ','',response),  # Remove the
    is_correct = response == correct_answer,
    is_start = response == start,
    is_end = response == end
  )

# Add accuracy data
attention <- attention %>%
  mutate(
    accuracy = ifelse(is_correct, 1, 0)
  )

attention <- merge(attention, critical %>% select(participant_id, passage_reading_time))

# Accuracy
critical <- critical %>%
  mutate(
    accuracy = ifelse(is_correct, 1, 0)
  )

# Exclude ppts who failed >=1 attention
attention_fail <- attention %>%
  group_by(participant_id) %>%
  summarize(accuracy = mean(accuracy), .groups="drop") %>%
  filter(accuracy < 1) %>%
  pull(participant_id)

critical <- critical %>%
  mutate(
    excluded.attention = participant_id %in% attention_fail
  )

df_fb_gpt3_dv <- df_fb_gpt3_dv %>%
  mutate(
    mdl.accuracy = case_when(
      condition == "False Belief" & log_odds > 0 ~ 1,
      condition == "False Belief" & log_odds <= 0 ~ 0,
      condition == "True Belief" & log_odds > 0 ~ 0,
      condition == "True Belief" & log_odds <= 0 ~ 1
    )
  )  

## Exclude ppts
critical.retained <- critical %>%
  filter(excluded.attention == F)

## Join with log-odds
df_merged = critical.retained %>%
  left_join(df_fb_gpt3_dv) 
nrow(df_merged)

## Recode responses

### Exclude responses from neither location
df_merged = df_merged %>%
  filter(is_start | is_end)
nrow(df_merged)

###
df_merged = df_merged %>%
  mutate(is_start_numeric = as.numeric(is_start))

# Cleanup
rm(ppts.raw)

