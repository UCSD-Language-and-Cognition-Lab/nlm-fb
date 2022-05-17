/* === NLM-FB Experiment === */


// Instructions
var instructions = {
  type: "html-keyboard-response",
  choices: [' '],
  stimulus: 
  `
  <div class='instructions-container'>
    <h2 class='instructions-header'>
      Passage Comprehension Task
    </h2>
    <p class='instructions'>
      In this experiment, you will first see a short story.
      Please read through the story once at your normal reading pace.
      Once you have read the story you will be asked to complete
      a sentence, which is a continuation of the story. Complete the
      sentence in the way that makes the most sense based on what you read
      in the story. Please use only a single word to complete the sentence.
      Finally you will be asked two questions about what happened in the
      story. Answer the questions with a single word.
    </p>

    <p class='instructions' id='continue' ontouchstart="response(32)">
      <b>Press the spacebar to continue to the passage.</b>
    </p>
  </div>`,
  post_trial_gap: 500,
  on_load: scrollTop,
  on_finish: function() {
    updateProgress();
    },
};

// Trial

function ParseCriticalResponse(data) {
    // Parse likert response from html
    let responses = JSON.parse(data.responses);
    data.response = responses["critical-response"];
    data.is_correct = data.response.toLowerCase() == data.correct_answer.toLowerCase();
    data.is_start = data.response.toLowerCase() == data.start.toLowerCase();
    data.is_end = data.response.toLowerCase() == data.end.toLowerCase();
}

function ParseAttnCheckResponse(data) {
    // Parse likert response from html
    let responses = JSON.parse(data.responses);
    data.response = responses["attn-check-response"];
    data.is_correct = data.response.toLowerCase() == data.correct_answer.toLowerCase();
}

function focusTextInput() {
  document.getElementById("critical-response").focus()
}

function focusSubmit() {
  document.getElementById("jspsych-survey-html-form-next").focus()
}

var Passage = {
  // Passage
  type: "html-keyboard-response",
  data: {trial_part: "passage"},
  choices: [' '],
  stimulus: function() {
    let passage = item_data.passage;
    let stimulus = 
        `<div class='trial'>

          <h2 class='header'>Passage</h2>

          <div class='passage'>

            ${passage}

          </div>

         <p class='instructions' id='continue' ontouchstart="response(32)">
          <b>Press the spacebar to continue to the questions.</b>
         </p>

        </div>`;
    return stimulus;
    },
  post_trial_gap: 500,
  on_finish: function(data) {
    // ParseResponse(data);
    updateProgress();
  }
};


var CriticalTrial = {
  // 
  type: "survey-html-form",
  data: function() {
    return {
        trial_part: 'trial',
        item_type: "critical",
        item: item_data.item,
        item_id: item_data.item_id,
        condition: item_data.condition,
        first_mention: item_data.first_mention,
        recent_mention: item_data.recent_mention,
        knowledge_cue: item_data.knowledge_cue,
        start: item_data.start,
        end: item_data.end,
        correct_answer: item_data.critical_a
    };
  },

  html: function() {
    let question = item_data.critical_q;
    let stimulus = 
        `<div class='trial'>
        <h3 class='header'>Continue the passage with a single word</h2>
            <div class='question-container critical'>
              <p class='question'>
                ${question}

                <div class='response critical'>
                  <input type="text" name="critical-response"
                         id="critical-response"
                         class="critical-response"
                         autocomplete="off"
                         placeholder=""
                         required
                  />
                </div>

              </p>

            </div>

        </div>`;
        return stimulus;
    },
  choices: jsPsych.NO_KEYS,
  post_trial_gap: 500,
  on_finish: function(data) {
    ParseCriticalResponse(data);
    updateProgress();
  },
  on_load: focusTextInput
};

var AttnCheckTrial1 = {
  // 
  type: "survey-html-form",
  data: function() {
    return {
        trial_part: 'trial',
        question_id: "start_loc",
        item_type: "attention_check",
        item: item_data.item,
        item_id: item_data.item_id,
        correct_answer: item_data.attn_check_1_a
    };
  },

  html: function() {
    let question = item_data.attn_check_1_q;
    let stimulus = 
        `<div class='trial'>
        <h3 class='attention_check'>Answer the question with a single word</h2>
            <div class='question-container critical'>
              <p class='question'>
                ${question}

                <div class='response critical'>
                  <input type="text" name="attn-check-response"
                         id="critical-response"
                         class="critical-response"
                         autocomplete="off"
                         placeholder=""
                         required
                  />
                </div>

              </p>

            </div>

        </div>`;
        return stimulus;
    },
  choices: jsPsych.NO_KEYS,
  post_trial_gap: 500,
  on_finish: function(data) {
    ParseAttnCheckResponse(data);
    updateProgress();
  },
  on_load: focusTextInput
};

var AttnCheckTrial2 = {
  // 
  type: "survey-html-form",
  data: function() {
    return {
        trial_part: 'trial',
        question_id: "end_loc",
        item_type: "attention_check",
        item: item_data.item,
        item_id: item_data.item_id,
        correct_answer: item_data.attn_check_2_a
    };
  },

  html: function() {
    let question = item_data.attn_check_2_q;
    let stimulus = 
        `<div class='trial'>
        <h3 class='header'>Answer the question with a single word</h2>
            <div class='question-container critical'>
              <p class='question'>
                ${question}

                <div class='response critical'>
                  <input type="text" name="attn-check-response"
                         id="critical-response"
                         class="critical-response"
                         autocomplete="off"
                         placeholder=""
                         required
                  />
                </div>

              </p>

            </div>

        </div>`;
        return stimulus;
    },
  choices: jsPsych.NO_KEYS,
  post_trial_gap: 500,
  on_finish: function(data) {
    ParseAttnCheckResponse(data);
    updateProgress();
  },
  on_load: focusTextInput
};

// Finish
var finish = {
  type: "html-keyboard-response",
  choices: [' '],
  stimulus: 
  `
  <div class='instructions-container'>
    <h2 class='instructions-header'>
      Section Complete
    </h2>
    <p class='instructions'>
      That concludes the comprehension question section of the experiment.
      Press the spacebar to continue.
    </p>
  </div>`,
  post_trial_gap: 500,
  on_load: scrollTop,
  on_finish: function() {
    updateProgress();
    },
};


// Create timeline

var exptTrialTimeline = [instructions, Passage, CriticalTrial,
                         AttnCheckTrial1, AttnCheckTrial2];

// Instruction, end, trials
var exptTrialCount = 5;



