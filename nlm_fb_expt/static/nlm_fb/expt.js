/* === Setup === */

/* --- Utils --- */

function saveResults() {
  // POST user data to server
  let url = `/${module_url}/save_results/`;
  let csrftoken = Cookies.get('csrftoken');
  let headers = {"X-CSRFToken": csrftoken};
  let results = jsPsych.data.get().values();
  let data = {results: results};
  data.ppt_id = conf.ppt_id;
  axios.post(url, data, {headers: headers})
    .then(response => {
      let debrief = document.getElementById("debrief");

      debrief.innerHTML = `
      <p class='instructions'>
        Thank you for completing the experiment. Please enter the following
        code into the Mechanical Turk window to recieve credit for your
        participation.
      </p>

      <div class='code-container'>
    
      <div id='code'>${conf.key}</div>

      <div class='code-copy' title="Copy code" onclick="copyToClipboard()">
        <img src="/static/pipr2/content_copy-24px.svg">
        </img>
      </div>

      <div id='copy-confirm' class='hidden'>
        Code copied to clipboard!
      </div>

    </div>

      <p class='instructions'>
        You can then close this window. Thanks again!
      </p>`;
    });
}

// Scroll to top
function scrollTop() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

// Copy credit code
function copyToClipboard() {

  const el = document.createElement('textarea');
  el.value = conf.key;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);

  var confirm = document.getElementById('copy-confirm');

  confirm.classList.add('show');

  setTimeout(function(){
    var confirm = document.getElementById('copy-confirm');
    confirm.classList.remove('show');
  }, 2000);

}

/* --- Prevent Back --- */

history.pushState(null, document.title, location.href);
window.addEventListener('popstate', function (event)
{
goBack = confirm("Are you sure you want to go back? Your progress will be lost.");
if (goBack) {
  window.history.back();
} else {
  history.pushState(null, document.title, location.href);
}
});

/* === Participant Data === */

/* ---- UA Data ---- */

function ua_data() {
    // Turk Info
    let turkInfo = jsPsych.turk.turkInfo();
    let data = turkInfo;
    data.ua_header = navigator.userAgent;
    data.width = window.innerWidth;
    data.height = window.innerHeight;
    data.ppt_id = conf.ppt_id;
    // data.worker_id = turkInfo.workerId;
    // data.assignment_id = turkInfo.assignmentId;
    return data;
}

function send_ua_data() {
  let data = ua_data();
  let url = "/nlm_fb/ua_data/";
  let csrftoken = Cookies.get('csrftoken');
  let headers = {"X-CSRFToken": csrftoken};
  axios.post(url, data, {headers: headers})
    .then(response => {
      // console.log(response.data);
    });
}

// Detect touchscreens
window.mobileAndTabletCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
const isTouch = window.mobileAndTabletCheck();

/* ---- CAPTCHA ---- */

function close_captcha() {
  let badges = document.getElementsByClassName('grecaptcha-badge');
  for (let badge of badges) {
    badge.style.visibility = "hidden";
  }
}

function validate_captcha(token) {
  // console.log(`validate_captcha(${token})`)
  let url = `/${module_url}/validate_captcha/`;
  let csrftoken = Cookies.get('csrftoken');
  let headers = {"X-CSRFToken": csrftoken};
  let data = {
    token: token,
    ppt_id: conf.ppt_id
  };
  axios.post(url, data, {headers: headers})
    .then(response => {
      // console.log(response.data);
      if (response.data.score > 0.2) {
        close_captcha();
        // jsPsych.finishTrial(response.data)
      } else {
        window.location.href = `/${module_url}/error`;
      }
    });
}

function ex_captcha() {
  grecaptcha.execute(
    '6Lc8nMwZAAAAAD9VUlj6EX69mgSSJ9ODDVPqrzJe',
    {action: 'submit'})
  .then(function(token) {
      // console.log(token)
      validate_captcha(token);
  });
}


/* ==== Progress Bar ==== */

// Initialise variables
trialCount = 0;  // Calculate based on trials

// welcome, consent, instr, p1, p2, eop, (stimuli), end_trials, vviq * 5, demo, post * 5

var current_trial = 0;


function updateProgress() {
  // Increment progress and update progress bar

  // Increment progress
  current_trial += 1;
  let pc = Math.round(current_trial * 100 / trialCount);

  // Show progress container
  let container = document.getElementById('progress-container');
  container.classList.remove('hide');


  // Update bar
  let bar = document.getElementById('progress-bar');
  bar.style.width = pc + "%";

  // Update counter
  let label = document.getElementById('progress-label');
  label.innerText = pc + "%";

}

/* ==== JsPsych General Components ==== */

// Fullscreen
var start_fullscreen = {
  type: 'fullscreen',
  fullscreen_mode: true,
  post_trial_gap: 500,
  on_finish: function() {
    send_ua_data();
  }
};

var end_fullscreen = {
  type: 'fullscreen',
  fullscreen_mode: false
};

// Welcome
var welcome = {
  type: "html-keyboard-response",
  choices: [' '],
  stimulus: `
             <div class='instructions-container'>
              <h2 class='instructions-header'>Welcome</h2>
              <p class='welcome'>Thank you for your interest in this study.</p>
              <p class='welcome' ontouchstart="response(32)">
                <b>Press the spacebar to continue</b>
              </p>
            </div>`,
  on_finish: updateProgress,
  on_load: function() {
    ex_captcha();
    scrollTop();
  }
};


// Consent
var consent = {
  type: "survey-html-form",
  html: `
             <div>
              <h2 class='instructions-header'>Consent</h2>
              <p class='instructions'>
              Please review the consent form below and check the box if
              you agree to participate.
              </p>

              <a target="_blank" href="/static/${module_url}/consent.pdf">Open in a new tab</a>
              
              <div id='consent-container'>
                <iframe src="/static/${module_url}/consent.pdf#view=FitH&zoom=FitH"
                width="100%", height="800px"></iframe>
              </div>

              <div class='input-group'>
                  <label for='consent'>I agree</label>
                  <input type='checkbox' name='consent' id='consent' required>
              </div>
            </div>`,
  on_finish: updateProgress,
  on_load: scrollTop
};


var post_test_purpose = {

  // Post Test Questionnaire
  type: "survey-html-form",
  html: `
  <h2 class='title'>Feedback</h3>

  <div class='debrief-container'>
    <div class='question'>
      <h3 class='question-title debrief'>What did you think the experiment was about?</h3>
    
      <textarea class="form-control debrief" id="post_test_purpose" name="post_test_purpose"
      required></textarea>
    </div>
  </div>`,
  choices: jsPsych.NO_KEYS,
  data: {trial_part: 'post_test'},
  on_finish: function() {
    updateProgress();
  }
};


var post_test_other = {

  // Post Test Questionnaire
  type: "survey-html-form",
  html: `
  <h2 class='title'>Feedback</h3>
  
  <div class='debrief-container'>
    <div class='question'>
      <h3 class='question-title debrief'>
        Do you have any other feedback or thoughts about the 
        experiment?
        (optional)
      </h3>
    
      <textarea class="form-control debrief" id="post_test_other"
      name="post_test_other"></textarea>
    </div>
  </div>`,
  choices: jsPsych.NO_KEYS,
  data: {trial_part: 'post_test'},
  on_finish: function() {
    updateProgress();
  }
};

var get_worker_id = {

  // Post Test Questionnaire
  type: "survey-html-form",
  html: `
  <h2 class='title'>Worker Id</h3>
  
  <div class='debrief-container'>
    <div class='question'>
      <h3 class='question-title debrief'>
        Please enter your Mechanical Turk Worker Id in the box below.
      </h3>
    
      <input type="text" class="form-control debrief" id="worker_id"
      name="worker_id"></input>
    </div>
  </div>`,
  choices: jsPsych.NO_KEYS,
  data: {trial_part: 'post_test'},
  on_finish: function() {
    updateProgress();
  }
};

var debrief_block = {
  type: "html-keyboard-response",
  choices: jsPsych.NO_KEYS,
  on_load: saveResults,
  stimulus: function() {
    
    s = `
    <div class='instructions-container'>
      <h2 class='instructions-header'>
        Experiment Complete
      </h2>

      <div id='debrief'>
        <p class='instructions'>
          Please wait while we validate your results...
        </p>

        <div class='loader-container'>
          <div class='loader'>
          </div>
        </div>
      </div>

    </div>`;

    return s;
  }
};

/* ==== Run Experiment ==== */

var timeline = [welcome, consent, start_fullscreen];
trialCount += 2;
// timeline = [];

/* --- Launch jsPsych --- */
window.onload = function() {

  /* --- nlm_fb Trials --- */

  timeline = timeline.concat(exptTrialTimeline);
  trialCount += exptTrialCount;

  /* ---- Demographics ---- */

  timeline = timeline.concat(demographicsTimeline);
  trialCount += demographicsTrialCount;

  /* ---- Debrief ---- */

  timeline.push(post_test_purpose, post_test_other, get_worker_id, debrief_block);
  trialCount += 3;

  if (! isTouch) {

    jsPsych.init({
      timeline: timeline,
      experiment_width: 800,
      display_element: "expt-container",
      exclusions: {
                    min_width : 900,
                    min_height : 650
                },
    });

  } else { // or bail out.
        let paragraph = document.getElementById("expt-container");
        paragraph.innerHTML = 
        `
        <div class='instructions-container'>
          <h2 class='instructions-header'>
            Mobile or Tablet detected
          </h2>

          <p class='instructions'>
            Please run this experiment on a desktop or laptop computer, not a mobile or tablet.
          </p>
        </div>
      `;
    }
};

