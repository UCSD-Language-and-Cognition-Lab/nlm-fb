# ---------------- #
# - Participants - #
# ---------------- #

preprocess.ppts <- function(ppts, from, til, sona=F, ip=c(), study=F) {
  
  ppts <- ppts %>%
    
    # Remove incomplete runs
    filter(end_time != "") %>%
    
    # Cast start & end to datetime
    mutate(
      start_time = as.POSIXct(start_time),
      end_time = as.POSIXct(end_time),
      
      # Calculate runtime
      runtime = difftime(end_time, start_time, units=c("mins")),
      
      # Calculate age
      current.year = as.numeric(format(start_time, format="%Y")),
      age = current.year - birth_year,
      
      # Modify columns
      id = as.factor(id),
      participant_id = id, # Easier joins
      ppt_id = id, # More concise
      excluded = 0  # Init excluded column
      
    ) %>%
    
    # Filter on date range & ips
    filter(
      # E3
      start_time > as.POSIXct(from),
      start_time < as.POSIXct(til),
    )
    
  if (ip != F) {
    ppts <- ppts %>%
      filter(!ip_address %in% ip)
  }
    
  # Filter on SONA code
  if (sona) {
    ppts <- ppts %>%
      filter(
        !SONA_code %in% c(NA, 131, 132)
      )
  }
  
  # Filter on study var
  if (study != F) {
    ppts <- ppts %>%
      filter(
        study == study
      )
  }
  
  return (ppts)
}

exclude.ppts <- function(ppts, native.eng, max.runtime) {
  
  # Native eng
  if (native.eng) {
    ppts <- ppts %>%
      mutate(
        ex.native_eng = native_english != "True",
        excluded = ex.native_eng
      )
  }
  
  # Native eng
  if (max.runtime) {
    ppts <- ppts %>%
      mutate(
        ex.runtime = (runtime > max.runtime) & (!excluded),
        excluded = excluded | ex.runtime
      )
  }
  
  return(ppts)
}

# Catch trials

exclude.ppts.catch <- function(ppts, trials, answers, task, catch.cutoff) {
  
  # Create colname for accuracy exclusion
  taskname <- quo_name(task)
  colname.accuracy <- paste0(taskname, ".catch.accuracy")
  colname.ex <- paste0("ex.", taskname, ".catch")
  
  catch.accuracy <- trials %>%
    
    # Get catch trials
    filter(item_type=="catch") %>%
    select(participant_id, item_id, response) %>%
    # Merge correct answers
    merge(answers) %>%
    # Mark as (in)correct
    mutate(
      correct = response == correct_response
    ) %>%
    # Find by-ppt accuracy
    group_by(participant_id) %>%
    summarize(
      !!colname.accuracy := mean(correct),
      .groups="drop"
    )
  
  ppts <- ppts %>%
    merge(catch.accuracy) %>%
    mutate(
      !!colname.ex := (!!as.name(colname.accuracy) < catch.cutoff) & (!excluded),
      excluded := (excluded | !!as.name(colname.ex) )
    )
  
  return(ppts)
}

# ---------- #
# - Trials - #
# ---------- #


exclude.relative.by.ppt <- function(df, column, nsd) {
  
  # Init excluded column if not there
  if (!("excluded" %in% colnames(df))) {
    df$excluded = FALSE
  }
  
  column <- enquo(column)
  colname <- quo_name(column)
  colname.lo <- paste0("ex.", colname, ".rel.lo")
  colname.hi <- paste0("ex.", colname, ".rel.hi")
  
  df <- df %>%
    group_by(participant_id) %>%
    mutate(
      col_mean := mean(!!as.name(colname)),
      col_sd := sd(!!as.name(colname)),
      !!colname.lo := (!!as.name(colname) < (col_mean - (nsd * col_sd)) & (!excluded)),
      !!colname.hi := (!!as.name(colname) > (col_mean + (nsd * col_sd)) & (!excluded)),
      excluded = ((excluded | !!as.name(colname.lo)) | !!as.name(colname.hi))
    ) %>%
    select(-col_mean, -col_sd) %>%
    ungroup()
  
  return(df)
}


exclude.absolute.by.ppt <- function(df, column, minval, maxval) {
  
  # Init excluded column if not there
  if (!("excluded" %in% colnames(df))) {
    df$excluded = FALSE
  }
  
  column <- enquo(column)
  colname <- quo_name(column)
  colname.lo <- paste0("ex.", colname, ".abs.lo")
  colname.hi <- paste0("ex.", colname, ".abs.hi")
  
  df <- df %>%
    group_by(participant_id) %>%
    mutate(
      !!colname.lo := (!!as.name(colname) < minval) & (!excluded),
      !!colname.hi := (!!as.name(colname) > maxval) & (!excluded),
      excluded = ((excluded | !!as.name(colname.lo)) | !!as.name(colname.hi))
    ) %>%
    ungroup()
  
  return(df)
}

exclude.ppt.ex.trials <- function(ppts, trials,
                                  thresh.removed.trials, colname="ex.trials.excluded") {
  
  ppts.excluded = trials %>%
    group_by(participant_id) %>%
    summarize(excluded = sum(excluded),
              excluded_prop = excluded / n(),
              .groups="drop") %>%
    filter(excluded_prop > thresh.removed.trials)
  
  ppts <- ppts %>%
    mutate(
      !!colname := (participant_id %in% ppts.excluded$participant_id) & (!excluded),
      excluded = excluded | (!!as.name(colname))
    )
  
  trials <- trials %>%
    mutate(
      ex.ppt.excluded = (participant_id %in% ppts.excluded$participant_id) & (!excluded),
      excluded = excluded | (ex.ppt.excluded)
    )
  
  return(list(ppts=ppts, trials=trials))
}

# ----------- #
# - Summary - #
# ----------- #

summarise.exclusions <- function(df) {
  summary.df <- df %>%
    select(starts_with("ex.")) %>%
    summarise(
      across(.fns=sum)
    )
  
  retained = nrow(df %>% filter(excluded==FALSE))
  reason = colnames(summary.df)
  removed = as.numeric(summary.df[1,])
  reason <- c(reason, "------", "Total Removed", "Retained")
  removed <- c(removed, NA, sum(removed), retained)
  removed.proportional <- round(removed / nrow(df), 3) * 100
  
  summary <- data.frame(reason, removed, removed.proportional)
  colnames(summary) <- c("Reason", "Removed", "(%)")
  return(summary)
}


# ------------- #
# - Prep Data - #
# ------------- #

get.df_merged <- function() {
  source("preprocess.R")
  return(df_merged)
}





