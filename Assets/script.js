var skyScrapperAPIKey = 'f415aaef18msh098b3a25521d368p1e429bjsn3cf183c9f438'
var baseSkyScrapperURL = 'https://sky-scrapper.p.rapidapi.com/api/v1/'
var searchBtn = document.querySelector('#button')
var baseSkyScrapperURL = 'https://sky-scrapper.p.rapidapi.com/api/v1'
var originInput = document.querySelector('#originInput')
var destinationInput = document.querySelector('#destinationInput')
var APIKey = "09a37924adb28c1359f0c44a9ee1ddcb";
var scrapper = document.getElementById('scrapper')
// var originInfo
// var destInfo

// Handles search for the city once clicked
async function handleSearchClick() {
    var originCity = originInput.value.trim()
    var destCity = destinationInput.value.trim()

    if (!destCity == "") {
        var destCords = await getCoordinates(destCity)
        destInfo = await flightInfo(destCords.lat, destCords.lon)

        if (originCity == '') {
            navigator.geolocation.getCurrentPosition(success, showError)
        }
        else {
            var originCords = await getCoordinates(originCity);
            originInfo = await flightInfo(originCords.lat, originCords.lon)
            flightPrice(originInfo.skyId, destInfo.skyId);
        }
        //information about the airport skyId and entityId

        getEventsSearch(destCity);
    }
    else {
        //Give the user a message telling them to enter a destination city.
        informUser("Enter a destination city.");
    }
    // take origin info and destInfo and use them to get the flight data for the two locations
}

function informUser(msg) {
    // Get the modal
    var modal = document.getElementById("msgModal");
    var span = document.getElementsByClassName("close")[0];
    var msg = $("#informMessage").text(msg);
    modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}
function showError(error) {
    //add modal to pop message to user saying there is no origin city
    informUser("Enter a starting city.");
}

async function success(pos) {
    const crd = pos.coords;
    //Pass local latitude and longitude to api to get the current weather.
    originInfo = await flightInfo(crd.latitude, crd.longitude)
    flightPrice(originInfo.skyId, destInfo.skyId);
}

// Get lat and lon for input city
function getCoordinates(city) {
    try {
        return fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${APIKey}`)
            .then(function (res) {
                return res.json()
            })
            .then(function (data) {
                var lat = data[0].lat
                var lon = data[0].lon
                return { lat, lon }
            })
    }
    catch (err) {
        console.log(err);
    };
}

Get flight parameters
function flightInfo(lat, lon) {
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': skyScrapperAPIKey,
            'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com'
        }
    };

    try {
        var FlightInfoURL = `${baseSkyScrapperURL}/flights/getNearByAirports?lat=${lat}&lng=${lon}`

        return fetch(FlightInfoURL, options)
            .then(function (response) {
                return response.json()
            })
            .then(function (data) {
                console.log(data);
                // return { skyId: data.data.current.skyId, entityId: data.data.current.entityId }
            });
    }
    catch (err) {
        console.log(err);
    };
}
// Get flight price information 
async function flightPrice(originSkyId, destSkyId) {
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': skyScrapperAPIKey,
            'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com'
        }
    };

    try {
        var flightPriceURL = `${baseSkyScrapperURL}/flights/getPriceCalendar?originSkyId=${originSkyId}&destinationSkyId=${destSkyId}&fromDate=2024-02-20`;

        const res = await fetch(flightPriceURL, options);

        const priceCalendarData = await res.json();

        console.log(priceCalendarData);

        displayFlightInfo(priceCalendarData.data.flights.days);

    } catch (err) {
        console.log(err);
    };
};

// Display flight information
function displayFlightInfo(flightCalendarArr) {
    flightCalendarArr.forEach(function (dayObj) {
        console.log(dayObj.price);
    });
}

var getEventsSearch = async function (city) {
    const eventsAPIKey = "KRxYIgVel9CyKuLI2MUA6RETp7Q3HXxl";
    const eventsAPIBaseUrl = "https://app.ticketmaster.com/discovery/v2/events.json";
    //URL for api cannot have spaces so replace any spaces in the city name with underscores
    var cityMod = city.replace(" ", "_");
    //var eventSearchParams = `?apikey=${eventsAPIKey}&city=${city}&size=20&sort=date,asc`
    var eventSearchParams = `?apikey=${eventsAPIKey}&sort=date,name,asc`;
    eventSearchParams = !cityMod == "" ? eventSearchParams + `&city=${cityMod}` : eventSearchParams;
    //append the keyword(s) to the url if they are present
    var evtKeyword = document.getElementById("eventsKeywordInput").value.trim();
    eventSearchParams = !evtKeyword == "" ? eventSearchParams + `&keyword=${evtKeyword}` : eventSearchParams;

    var apiUrl = eventsAPIBaseUrl + eventSearchParams;
    console.log(apiUrl);

    try {
        //Dynamically add events to the list. The function takes: tag type, image source (if applicable), id, id suffix, 
        //mouse over action, mouse out action, cursor style, class, and text content.
        //addEventList(tagType, imgSrc, id, idSuffix, mouseOver, mouseOut, cursorStyle, classType, contentVal)
        const res = await fetch(apiUrl);
        const data = await res.json();
        //max image size to display
        var imgWidth = 205;
        var imgHeight = 115;
        var mouseActionUnderline = "this.style.textDecoration='underline'";
        var mouseActionNone = "this.style.textDecoration='none'";
        var tagP = "<p>";

        if (window.screen.height <= 900) {
            //min image size to display
            imgWidth = 100;
            imgHeight = 56;
        }
        else {
            //max image size to display
            imgWidth = 205;
            imgHeight = 115;
        }

        for (var i = 0; i <= data._embedded.events.length; i++) {
            //add the event venue(s)
            for (v = 0; v < data._embedded.events[i]._embedded.venues.length; v++) {
                addEventList(tagP, "", "events-list", data._embedded.events[i].id, "V", mouseActionUnderline,
                    mouseActionNone, "cursor: pointer", data._embedded.events[i]._embedded.venues[v].name);
            }

            //add the event date
            addEventList(tagP, "", "events-list", data._embedded.events[i].id, "D", mouseActionUnderline,
                mouseActionNone, "cursor: pointer", eventDate);

            //add the event name
            addEventList(tagP, "", "events-list", data._embedded.events[i].id, "N", mouseActionUnderline,
                mouseActionNone, "cursor: pointer", data._embedded.events[i].name);
            var localEventDate = data._embedded.events[i].dates.start.localDate;
            var localEventTime = data._embedded.events[i].dates.start.localTime;
            var eventDate = dayjs(localEventDate + " " + localEventTime).format("MM/DD/YYYY  h:mm a");

            //add the event image. multiple images available so loop through to get correct size
            for (var m = 0; m < data._embedded.events[i].images.length; m++) {
                if (data._embedded.events[i].images[m].width == imgWidth && data._embedded.events[i].images[m].height == imgHeight) {
                    addEventList('<img>', data._embedded.events[i].images[m].url);
                    break;
                }
            }

            //Skip adding html elements if no event returned
            if (data.page.totalPages >> 0) {
                for (var i = 0; i < data._embedded.events.length; i++) {
                    var newBlockRow = $("<div>")
                    newBlockRow.addClass("grid grid-cols-11 grid-rows-3 grid-flow-col gap-4 border-black")
                    //add the event image. multiple images available so loop through to get correct size
                    for (var m = 0; m < data._embedded.events[i].images.length; m++) {
                        if (data._embedded.events[i].images[m].width == imgWidth && data._embedded.events[i].images[m].height == imgHeight) {
                            addEventList(newBlockRow, '<img>', data._embedded.events[i].images[m].url, "row-span-3 col-span-1");
                            break;
                        }
                    }

                    //add the event name
                    addEventList(newBlockRow, tagP, "", "col-span-8", data._embedded.events[i].id, "N", mouseActionUnderline,
                        mouseActionNone, "cursor: pointer", data._embedded.events[i].name);

                    //add the event date
                    var localEventDate = dayjs(data._embedded.events[i].dates.start.localDate).format("MM/DD/YYYY");
                    var localEventTime = data._embedded.events[i].dates.start.localTime;
                    //if the time isn't passed in the response only display the date
                    var eventDate = localEventTime == null ? localEventDate : dayjs(localEventDate + " " + localEventTime).format("MM/DD/YYYY  h:mm a");

                    addEventList(newBlockRow, tagP, "", "col-span-8", data._embedded.events[i].id, "D", mouseActionUnderline,
                        mouseActionNone, "cursor: pointer", eventDate);

                    //add the event venue(s)
                    for (v = 0; v < data._embedded.events[i]._embedded.venues.length; v++) {
                        addEventList(newBlockRow, tagP, "", "col-span-8", data._embedded.events[i].id, "V", mouseActionUnderline,
                            mouseActionNone, "cursor: pointer", data._embedded.events[i]._embedded.venues[v].name);
                    }
                }
            }
        }
    catch (err) {
            console.log(err);
        };

    };

    function addEventList(tagType, imgSrc, classType, id, idSuffix, mouseOver, mouseOut, cursorStyle, contentVal) {
        var newLi = $("<li>")
        function addEventList(parentDiv, tagType, url, classType, id, idSuffix, mouseOver, mouseOut, cursorStyle, contentVal) {
            var newTag = $(tagType);

            if (tagType == "<img>") {
                newTag.attr("src", imgSrc);
                if (tagType == "<img>") {
                    newTag.attr("src", url);
                    newTag.addClass(classType);
                }
                else {
                    console.log("other");
    else {
                newTag.attr("id", id + idSuffix);
                //newTag.attr("onmouseover", mouseOver)
                //newTag.attr("onmouseout", mouseOut)
                //newTag.attr("style", cursorStyle)
                newTag.addClass(classType);
                newTag.text(contentVal);
            }

            newLi.append(newTag)
            $("#eventsList").prepend(newLi);
            if (!tagType == "<img>") {
                $("#" + id).on("click", function () {
                    parentDiv.append(newTag)
                    $("#eventsList").prepend(parentDiv);
                    if (!tagType == "<img>") {
                        $("#" + id + idSuffix).on("click", function () {
                            console.log("Clicked event" + tagType + " " + id);
                        });
                    }
                }

// Record searches
const searchOrigin = document.getElementById("originInput")
                const searchInput = document.getElementById("destinationInput");


                function recordSearch() {
                    const recentSearches = JSON.parse(localStorage.getItem("prevSearches")) || [];
                    const searchTerm = searchInput.value.trim(); // getting Going To Data
                    const searchOriginTerm = searchOrigin.value.trim() // getting Origin Data
                    const newPath = [searchOriginTerm, searchTerm]

                    if (searchTerm !== "") {
                        recentSearches.unshift(newPath); // bring in the small arr into the main arr

                        if (recentSearches.length > 5) {
                            recentSearches.pop();
                        }

                        localStorage.setItem("prevSearches", JSON.stringify(recentSearches));

                        displayRecentSearches();
                    }
                    searchOrigin.value = "";
                    searchInput.value = "";
                }

                // Display recent searches
                function displayRecentSearches() {
                    const recentSearches = JSON.parse(localStorage.getItem("prevSearches")) || [];
                    const recentSearchesList = document.getElementById("prevSearches");

                    recentSearchesList.innerHTML = "";

                    for (const search of recentSearches) {
                        const listItem = document.createElement("li");
                        listItem.classList.add("listSearches");
                        listItem.textContent = search;
                        recentSearchesList.appendChild(listItem);
                        listItem.addEventListener("click", function (event) {
                            const userChoice = event.target.textContent
                            const originCity = userChoice.split(',')[0]
                            const destinationCity = userChoice.split(',')[1]
                            searchOrigin.value = originCity
                            searchInput.value = destinationCity
                        })
                    }
                }


                // Calls displayRecentSearches to load previously made searches
                displayRecentSearches();

                // Add an event listener to search button to kick off searches and trigger recordSearch function
                searchBtn.addEventListener("click", function () {
                    handleSearchClick();
                    recordSearch();
                });

                //Simulate pushing the search button when the Enter key is pushed inside the destination input box
                $("#destinationInput").keyup(function (event) {
                    if (event.keyCode === 13) {
                        searchBtn.click();
                    }
                });