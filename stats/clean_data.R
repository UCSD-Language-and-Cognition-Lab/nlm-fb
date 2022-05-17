# Clean data (this will not work on de-identified data)

library(dplyr)

date.start <- "2022-04-06 00:00:00"
date.end <- "2022-04-08 00:00:00"

# Load data
ppts.raw <- read.csv("../data/raw/nlm_fb_participant.csv")
critical.raw <- read.csv("../data/raw/nlm_fb_critical.csv")
attention.raw <- read.csv("../data/raw/nlm_fb_attention_check.csv")

# Preprocess data
ppts.all <- preprocess.ppts(
  ppts.raw, date.start, date.end, sona=F, ip=F, study=1) %>%
  filter(tolower(substr(worker_id, 1, 1)) == "a")

# Remove identifiable columns
ppts.all <- ppts.all %>%
  select(id, start_time, end_time, birth_year, gender, native_english, dyslexia, adhd, asd,
         vision, vision_reason, post_test_purpose, post_test_other)

# Filter trial data

critical <- critical.raw %>%
  filter(participant_id %in% ppts.all$id)

attention <- attention.raw %>%
  filter(participant_id %in% ppts.all$id)


# Save data

write.csv(ppts.all, "../data/clean/nlm_fb_participants_clean.csv", row.names=F)
write.csv(critical, "../data/clean/nlm_fb_critical_clean.csv", row.names=F)
write.csv(attention, "../data/clean/nlm_fb_attention_clean.csv", row.names=F)
