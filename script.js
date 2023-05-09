let storedList = []; //Global array to store all shows
function createBubbleChart(data) {
    Highcharts.chart('container', {
      chart: {
        type: 'packedbubble',
        height: '900px'
    },
    title: {
        text: 'Select a bubble to browse.',
        align: 'left'
    },
    tooltip: {
        useHTML: true,
        pointFormat: '<b>{point.name}:</b> | Rating: {point.value}'
    },
    plotOptions: {
        packedbubble: {
            minSize: '0%',
            maxSize: '80%',
            draggable: true,
            zMin: 0,
            zMax: 5,
            layoutAlgorithm: {
                gravitationalConstant: 0.1,
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
                    value: 101
                },
                style: {
                    color: 'black',
                    textOutline: 'none',
                    fontWeight: 'normal'
                }
            }
        },
        series: {
          cursor: 'pointer',
          point: {
              events: {
                  click: function () {
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
      item.genres.forEach(genre => {
        const existingCountry = output.find(e => e.name === genre);
        if (existingCountry) {
          existingCountry.data.push({ name: item.name, value: item.weight, id: item.id});
        } else {
          output.push({
            name: genre,
            data: [{ name: item.name, value: item.weight, id: item.id}]
          });
        }
      });
    });
    console.log(output)
    return output;
  }

async function mainEvent() {
    console.log("loading data");

    // Basic GET request - this replaces the form Action
    const results = await fetch(
        "https://api.tvmaze.com/shows"    
    );

    const result = await results.json()
    storedList = transformArray(result)
    console.log(storedList)
}

document.addEventListener("DOMContentLoaded", async () => mainEvent()); // the async keyword means we can make API requests