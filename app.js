import { wellnessData } from "./wellnessData.js";
let checklistData;
if (localStorage.getItem("wellnessDataLocal")) {
  checklistData = [...JSON.parse(localStorage.getItem("wellnessDataLocal"))];
} else {
  checklistData = [...wellnessData];
}

// Background Handler
fetch(
  "https://api.unsplash.com/photos/random?orientation=landscape&query=coffee-shop", //REAL URL, USE IN PRODUCTION
  // "https://apis.scrimba.com/unsplash/photos/random?orientation=landscape&query=coffee-shop"
  {
    headers: {
      Authorization: `Client-ID fvAmCkmQSj1qJQWU8VrNx6V6OkozjkhBNyJ2Q2XSPnY`,
    },
  }
)
  .then((res) => {
    if (!res.ok) {
      throw Error("Something went wrong");
    }
    return res.json();
  })
  .then((data) => {
    const authorLink = document.getElementById("bg-author");
    authorLink.textContent = data.user.name;
    authorLink.href = data.user.links.html;

    document.body.style.backgroundImage = `url(${data.urls.full})`;
  })
  .catch((e) => {
    console.log(e);
    document.body.style.backgroundImage = `url(https://images.unsplash.com/photo-1469957761306-556935073eba?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwxNDI0NzB8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NzEzNTcyMjY&ixlib=rb-4.0.3&q=80)`;
  });

// Time Handler
function getCurrentTime() {
  const date = new Date();

  document.getElementById("time").textContent = date.toLocaleTimeString(
    "en-us",
    { timeStyle: "short" }
  );
}

setInterval(getCurrentTime, 1000);

// Search Handler

document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const searchInput = document.getElementById("google-search");
  let query = ``;
  if (searchInput.value) {
    searchInput.value.split(" ").forEach((word) => {
      query += `${word}+`;
    });
    query = query.slice(0, -1);
    window.location.assign(`https://www.google.com/search?q=${query}`);
  }
  // https://www.google.com/search?q=js+go+to+another+page+on+submit
});

// Weather Handler

let isFahrenheit = true;
if (localStorage.getItem("isFahrenheit")) {
  isFahrenheit = JSON.parse(localStorage.getItem("isFahrenheit"));
}
const weatherContainer = document.getElementById("weather-cont");
const noWeatherHtml = "<h5>Enable location/Weather is not available</h5>";
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition((position) => {
    fetch(
      `https://apis.scrimba.com/openweathermap/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=imperial`
    )
      .then((res) => {
        if (!res.ok) {
          throw Error("Weather data not available");
        }
        return res.json();
      })
      .then((data) => {
        const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        const fahrenheitText = `${Math.round(data.main.temp)}ºF`;
        const celsiusText = `${Math.trunc(
          Math.round((data.main.temp - 32) * 0.5556)
        )}ºC`;
        // let isFahrenheit = true;

        weatherContainer.innerHTML = `
          <div>
            <h3 class="weather-temp">${
              isFahrenheit ? fahrenheitText : celsiusText
            }</h3>
            <img src=${iconUrl} />
          </div>
          <h4 class="weather-city">${data.name}</p>
        `;

        document
          .querySelector(".weather-temp")
          .addEventListener("click", () => {
            const weatherText = document.querySelector(".weather-temp");
            if (isFahrenheit) {
              weatherText.textContent = celsiusText;
              isFahrenheit = false;
              localStorage.setItem("isFahrenheit", false);
            } else {
              weatherText.textContent = fahrenheitText;
              isFahrenheit = true;
              localStorage.setItem("isFahrenheit", true);
            }
          });
      })
      .catch((err) => {
        console.error(err);
        weatherContainer.innerHTML = noWeatherHtml;
      });
  });
} else {
  weatherContainer.innerHTML = noWeatherHtml;
}

// Check if new day

const fullDate = new Date();
const currentDay = fullDate.getDate();
if (JSON.parse(localStorage.getItem("checkedDay")) !== currentDay) {
  checklistData = [...wellnessData];
}
localStorage.setItem("checkedDay", JSON.stringify(currentDay));

// Champion Checklist Handler

const listContainer = document.querySelector("#list-cont");
function renderChecklist() {
  let listContHtml = "";
  checklistData.forEach((element) => {
    listContHtml += `
      <div>
        <h6 class="checkbox" data-checked="${element.uuid}">${
      checklistData[element.uuid].isChecked ? "X" : ""
    }<h6>
        <p>${element.task}<p>
      </div>
    `;
    listContainer.innerHTML = listContHtml;
  });
}

document.querySelector("#champion-checklist").addEventListener("click", (e) => {
  if (e.target.dataset.checked) {
    handleCheck(parseInt(e.target.dataset.checked));
  }
});

function handleCheck(id) {
  const targetListItem = checklistData.filter((item) => {
    return item.uuid === id;
  })[0];

  targetListItem.isChecked = !targetListItem.isChecked;
  localStorage.setItem("wellnessDataLocal", JSON.stringify(checklistData));
  renderChecklist();
}

renderChecklist();
