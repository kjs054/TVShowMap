//Show Details Elements
const showImage = document.getElementById("show-image")
const showDescription = document.querySelector(".show-description")
const showTitle = document.querySelector(".show-title")
const showRating = document.querySelector(".show-rating")
const showRuntime = document.querySelector(".show-runtime")
const showDetails = document.querySelector(".show-details")

//Filtering elements
const search = document.getElementById("search");
const usFilter = document.querySelector("input[name=us-filter]");
const airingFilter = document.querySelector("input[name=airing-filter]");
const reloadBtn = document.querySelector("#reload-btn");
const container = document.querySelector("#container");

// Creates the bubble chart and adds it to the main div
function createBubbleChart(data, color = undefined) {
  console.log(data)
  data = transformArray(data)
  if (color != undefined) {
    // Set custom color if defined
    data[0]["color"] = color
  }
  const isChild = data.length == 1
  Highcharts.chart('container', {
    chart: {
      animation: false,
      type: 'packedbubble',
      height: '100%'
  },
  boost: {
    useGPUTranslations: true,
    usePreAllocated: true
  },
  title: {
      text: 'Select a bubble to browse.',
      align: 'left'
  },
  tooltip: {
      useHTML: true,
      pointFormat: '<b>{point.name}:</b>'
  },
  plotOptions: {
      packedbubble: {
          minSize: '0%',
          maxSize: '80%',
          draggable: true,
          useSimulation: false,
          zMin: 0,
          zMax: isChild ? 140 : 5,
          layoutAlgorithm: {
              gravitationalConstant: isChild ? 0.015 : 0.1,
              splitSeries: true,
              seriesInteraction: false,
              dragBetweenSeries: false,
              parentNodeLimit: false
          },
          dataLabels: {
              enabled: true,
              format: '{point.name}',
              filter: {
                  property: 'y',
                  operator: '>',
                  value: isChild ? 30 : 101
              },
              style: {
                  color: 'black',
                  textOutline: 'none',
                  fontWeight: 'normal',
                  fontSize: '15px'
              }
          }
      },
      series: {
        animationLimit: 0,
        animation: false,
        cursor: 'pointer',
        point: {
            events: {
                click: function () {
                    //Display show details when bubble is clicked
                  displayShowDetails(this.id)
                }
            }
        }
    }
  },
    series: data
  });
}

function displayShowDetails(show) {
  // Display the show details on the right side
  const storedShows = JSON.parse(localStorage.getItem("storedShows"))
  showDetails.classList.remove("hide")
  const selectedShow = storedShows[show]
  showImage.src = selectedShow.image.medium
  showTitle.innerHTML = selectedShow.name
  showDescription.innerHTML = selectedShow.summary
  showRating.innerHTML = "Rating: " + selectedShow.rating.average * 10
  showRuntime.innerHTML = "Runtime: " + selectedShow.averageRuntime + " min"
}

function transformArray(input) {
  const output = [];
  input.forEach(item => {
      const existingCountry = output.find(e => e.name === item.genres[0]);
      if (existingCountry) {
        existingCountry.data.push({ name: item.name, value: item.rating.average * 10, id: item.id});
      } else {
        output.push({
          name: item.genres[0],
          data: [{ name: item.name, value: item.rating.average * 10, id: item.id}]
        });
      }
  });
  return output;
}

function transformJSONArrayToDict(data) {
  const cleaned = data.filter(show => {
    if (show.network == null || show.rating.average == null) {

    } else {
      return show
    }
  })
  const transformed = cleaned.reduce((obj, item) => {
    var item = item
    var key = item.id // take first character, uppercase
    item.country = item.network.country.code
    item.genre = item.genres[0]
    obj[key] = item;
    return obj
  }, {});
  return transformed
}

var showsList = {}
const pagesCount = 50
async function fetchShows(page = 0) {
  if (page == 0) {
    showsList = {}
  }
    const results = await fetch(
      "https://api.tvmaze.com/shows?page=" + page    
    );
    const result = await results.json()
    const transformed = transformJSONArrayToDict(result)
    showsList = Object.assign({}, transformed, showsList)
    container.innerHTML = "Loading " + Object.keys(showsList).length + " Shows Found"
    if (page != pagesCount) {
      page++;
      await new Promise((resolve) => setTimeout(resolve, 200)); // setup a sleep depend your api request/second requirement.
      return await fetchShows(page);
  } else {
    return showsList
  }
}

async function mainEvent() {
  // the async keyword means we can make API requests
  console.log("loading data");
  
  await loadData()

  search.addEventListener("input", (e) => { 
    const searchQuery = e.target.value;
    const filtered = filteredData().filter((item) => {
      const lowerCaseName = item.name.toLowerCase();
      const lowerCaseQuery = searchQuery.toLowerCase();
      return lowerCaseName.includes(lowerCaseQuery);
    });
    createBubbleChart(filtered)
  });

  reloadBtn.addEventListener("click", async (e) => {
    localStorage.removeItem("storedShows")
    await loadData()
  });

  usFilter.addEventListener("change", (e) => {
    if (usFilter.checked) {
      filters["country"] = "US"
    } else {
      delete filters["country"]
    }
    createBubbleChart(filteredData())
  });

  airingFilter.addEventListener("change", (e) => {
    if (airingFilter.checked) {
      filters["status"] = "Running"
    } else {
      delete filters["status"]
    }
    createBubbleChart(filteredData())
  });
}

async function loadData() {
  if (typeof window.localStorage != "undefined") {
    if (localStorage.getItem("storedShows") === null) {
      const shows = await fetchShows()
      localStorage.setItem("storedShows", JSON.stringify(shows));
    }
    createBubbleChart(filteredData())
  } else {
    // Local storage is not supported
    const shows = await fetchShows()
    createBubbleChart(filteredData())
  }
}

// Filtering functions 

const filters = {"country": "US", "status": "Running"}

function filteredData() {
  const storedShows = JSON.parse(localStorage.getItem("storedShows"))
  const filteredData = Object.values(storedShows).filter(show => {
    return Object.entries(filters).every(([k, v]) => show[k] == v)
  })
  return filteredData
}

function filterByGenre(genre, color) {
  filters["genre"] = genre
  createBubbleChart(filteredData(), color)
}

document.addEventListener("DOMContentLoaded", async () => mainEvent()); // the async keyword means we can make API requests