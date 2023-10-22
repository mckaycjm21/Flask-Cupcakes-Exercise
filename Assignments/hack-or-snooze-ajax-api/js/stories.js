"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let currentStoryID;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  // if a user is logged in, show favorite/not-favorite star
  const showStar = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
        <div> 
        ${showDeleteBtn ? getDeleteBtnHTML() : ""}
        ${showStar ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <div class="story-author">by ${story.author}</div>
        <div class="story-user">posted by ${story.username}</div>
        </div>
      </li>
    `);
}


function generateStoryMarkupUser(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  // if a user is logged in, show favorite/not-favorite star
  const showStar = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
        <div> 
        <a class="nav-link" href="#" id="nav-edit-story">Edit</a>
        ${showDeleteBtn ? getDeleteBtnHTML() : ""}
        ${showStar ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <div class="story-author">by ${story.author}</div>
        <div class="story-user">posted by ${story.username}</div>
        </div>
      </li>
    `);
}


function getDeleteBtnHTML() {
  return `
      <span class="trash-can">
        <i class="fas fa-trash-alt"></i>
      </span>`;
}

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function deleteStory(evt) {
  console.debug("deleteStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

  // re-generate story list
  await putUserStoriesOnPage();
}

$ownStories.on("click", ".trash-can", deleteStory);



async function userSubmitStory(evt){
  console.debug("userSubmitStory");
  evt.preventDefault();


  let author = $("#author").val();
  let title = $("#title").val();
  let url = $("#url").val();
  const username = currentUser.username
  const storyData = { title, url, author, username };

  const story = await storyList.addStory(currentUser, storyData);
  
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $addStory.trigger("reset");
}
$addStory.on("submit", userSubmitStory);



function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    // loop through all of users stories and generate HTML for them
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }
}
function putEditUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    // loop through all of users stories and generate HTML for them
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkupUser(story, true);
      $ownStories.append($story);
    }
  }
}


function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  } else {
    // loop through all of users favorites and generate HTML for them
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkupUser(story);
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();
}

/** Handle favorite/un-favorite a story */

async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  // see if the item is already favorited (checking by presence of star)
  if ($tgt.hasClass("fas")) {
    // currently a favorite: remove from user's fav list and change star
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  } else {
    // currently not a favorite: do the opposite
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}

$storiesLists.on("click", ".star", toggleStoryFavorite);



$section.on("click", ".nav-link", async function(){
  currentStoryID = this.parentNode.parentNode.id
  console.log(currentStoryID);
  const getClickedStory = await axios.get(`https://hack-or-snooze-v3.herokuapp.com/stories/${currentStoryID}`)
  const clickedAuthor = getClickedStory.data.story.author;
  const clickedTitle = getClickedStory.data.story.title;
  const clickedUrl = getClickedStory.data.story.url;
  console.log(clickedAuthor, clickedTitle, clickedUrl)
  $("#edit-author").val(clickedAuthor);
  $("#edit-title").val(clickedTitle);
  $("#edit-url").val(clickedUrl);
})

async function submitEditStory(evt){
  console.debug("submitEditStory");
  evt.preventDefault();

  let author = $("#edit-author").val();
  let title = $("#edit-title").val();
  let url = $("#edit-url").val();

  const response = await axios.patch(`https://hack-or-snooze-v3.herokuapp.com/stories/${currentStoryID}`,
  {
    "token": currentUser.loginToken,
    "story": {
      "author": author,
      "title": title,
      "url": url,
    }
  });
  console.log(response);
  
  const $story = generateStoryMarkupUser(response);
  $allStoriesList.prepend($story);

  $editStoryForm.trigger("reset");
}
$editStoryForm.on("submit", submitEditStory);







  // const response = await axios.patch(`https://private-anon-c31a3cfca4-hackorsnoozev3.apiary-mock.com/stories/${clickedID}`,
  // {
  //   "story": {
  //     "author": "Matt Lane",
  //     "createdAt": "017-11-09T18:38:39.409Z",
  //     "storyId": "5081e46e-3143-4c0c-bbf4-c22eb11eb3f5",
  //     "title": "The Best Story Ever",
  //     "updatedAt": "017-11-09T18:38:39.409Z",
  //     "url": "https://www.rithmschool.com/blog/do-web-developers-need-to-be-good-at-math",
  //     "username": "hueter"
  //   }
  // });
  
  // console.log(response);