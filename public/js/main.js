/*
 * Api Data Météo - Ville de Chelles
 * https://www.infoclimat.fr/api-previsions-meteo.html?id=3025622&cntry=FR
 */
async function start() {
  const weatherPromise = await fetch("https://www.infoclimat.fr/public-api/gfs/json?_ll=48.88109,2.59295&_auth=ABoAF1UrBCYCLwE2VCJWf1kxVGEKfFN0BHgFZghtVClSOVI%2BD20BY1YwBHlTfAI0UXwPalxqU2kKYAdlAHIEeABgAGRVNARjAmsBYVRmVn1ZdVQ8CjNTbQRlBWQIelQoUjBSMg9rAX1WOARgU2ICKFFgD2xcYVN1CmEHYgByBHgAYgBjVTYEYQJpAWRUZlZmWWxUNwoqU3QEYQVnCDZUMlJnUjAPaAE1VjoEYVM3AmdRMA9nXH1TbApvB2YAZQRvAGUAZ1UxBHkCcgEaVBdWf1kqVHYKYFMtBHoFNwg7VGM%3D&_c=b94fdf29ef9a71d11bbb328a194575ae")
  const weatherData = await weatherPromise.json()

  let currentDate = new Date()
  let year = currentDate.getFullYear()
  let month = ('0' + (currentDate.getMonth() + 1)).slice(-2)
  let day = ('0' + currentDate.getDate()).slice(-2)

  let formattedDate = year + '-' + month + '-' + day + ' 13:00:00';
  const temperature = (weatherData[formattedDate].temperature.sol - 273).toFixed(1);

  // console.log(temperature)
  document.querySelector("#temperature-output").textContent = temperature
}

start()

// pet filter button code
const allButtons = document.querySelectorAll(".pet-filter button")

allButtons.forEach(el => {
  el.addEventListener("click", handleButtonClick)
})

function handleButtonClick(e) {
  // remove active class from any and all buttons
  allButtons.forEach(el => el.classList.remove("active"))

  // add active class to the specific button that just got clicked
  e.target.classList.add("active")

  // actually filter the pets down below
  const currentFilter = e.target.dataset.filter
  document.querySelectorAll(".pet-card").forEach(el => {
    if (currentFilter == el.dataset.species || currentFilter == "tous") {
      el.style.display = "grid"
    } else {
      el.style.display = "none"
    }
  })
}