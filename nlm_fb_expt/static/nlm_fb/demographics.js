/* === Demographics === */

/* --- Language Utils --- */

// Add a new row to the countries table
function addCountryRow() {
    // Get country div and current length
    var countryBox = document.getElementById('country-box-container')
    var len = countryBox.children.length ;

    // Remove 'Add Row' button at 5 countries
    if (len == 6) {
        countryButton = document.getElementById('addCountryButton')
        countryButton.disabled = true;
        countryButton.title = "5 is the maximum number of countries"
    }

    // Create new row with HTML from template
    var newRow = document.getElementById('country-row').innerHTML;
    var newDiv = document.createElement('DIV');
    newDiv.innerHTML = newRow;
    countryBox.insertBefore(newDiv, countryBox.childNodes[len + 1]);

    // Update the names of the new inputs
    var children = newDiv.firstElementChild.children
    var ind = len - 1;
    children[0].firstElementChild.name = "country_" + ind
    children[1].firstElementChild.name = "country_from_" + ind
    children[2].firstElementChild.name = "country_to_" + ind
}

// Add a new row to the languages table
function addLanguageRow() {
    // Get language div and current length
    var box = document.getElementById('language-box-container')
    var len = box.children.length ;

    // Remove 'Add Row' button at 5 countries
    if (len == 6) {
        var button = document.getElementById('addLanguageButton')
        button.disabled = true;
        button.title = "5 is the maximum number of languages"
    }

    // Create new row with HTML from template
    var newRow = document.getElementById('language-row').innerHTML;
    var newDiv = document.createElement('DIV');
    newDiv.innerHTML = newRow;
    box.insertBefore(newDiv, box.childNodes[len + 1]);

    // Update the names of the new inputs
    var children = newDiv.firstElementChild.children
    var ind = len - 1;
    children[0].firstElementChild.name = "language_" + ind
    children[1].firstElementChild.name = "language_proficiency_" + ind
    children[2].firstElementChild.name = "language_learned_" + ind
    children[3].firstElementChild.name = "language_active_" + ind
    children[4].firstElementChild.name = "language_proportion_" + ind
}

/* --- JsPsych Timeline --- */

var demographicsTemplate = document.querySelector('#demographics');

// End Trials
var demographicsIntro = {
  type: "html-keyboard-response",
  stimulus: `
  <div class='instructions-container'>
      <h2 class='instructions-header'>
        End of Comprehension Questions
      </h2>
    <p class='instructions'>
      Thank you. You have completed all of the comprehension questions.
    </p>

    <p class='instructions c'>
    You will now be asked a short series of questions about yourself and
    your thoughts about the experiment.</p>
    </p>

  <p class='instructions' ontouchstart="response(32)" id='next'>
      <b>Press continue to begin<b>
    </p>`,
  on_finish: updateProgress
};

var demographics = {

  // Demographics Trial
  type: "survey-html-form",
  html: demographicsTemplate.innerHTML,
  choices: jsPsych.NO_KEYS,
  data: {trial_part: 'demographics'},
  on_finish: updateProgress

};

var demographicsTimeline = [demographicsIntro, demographics];
var demographicsTrialCount = 2;
