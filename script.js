//Globally accessible object for shows with key being their ID
let storedShows = {};

function createBubbleChart(data, color = undefined) {
    console.log(data)
    data = transformArray(data)
    if (color != undefined) {
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
                    // if (isChild == false) {
                    //   // filterByGenre(this.series.userOptions.name, this.color)
                    // } else {
                    //   if (this.name != undefined) {
                    console.log(this.id)
                    displayShowDetails(this.id)
  
                  }
              }
          }
      }
    },
      series: data
    });
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
      if (show.network != null || show.rating.average != null) {
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

async function mainEvent() {
    console.log("loading data");
    
    // Basic GET request - this replaces the form Action
    const results = await fetch(
        "https://api.tvmaze.com/shows"    
    );

    const result = await results.json()
    storedList = transformJSONArrayToDict(shows)
    createBubbleChart(filteredData())

    
}

// Filtering functions

const filters = {"country": "US", "status": "Running"} // Default filters

function filteredData() {
    // Remove items in global shows data that do not adhere to filter values
    const filteredData = Object.values(storedList).filter(show => {
        return Object.entries(filters).every(([k, v]) => show[k] == v)
    })
    return filteredData
}

document.addEventListener("DOMContentLoaded", async () => mainEvent()); // the async keyword means we can make API requests