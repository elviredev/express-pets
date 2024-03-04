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

/*
 * Ouvrir/Fermer l'overlay avec le formulaire de contact au clic sur icon eveloppe
 */

document.querySelector(".form-overlay").style.display = ""
// Ouvrir overlay
function openOverlay(el) {
  // Récupérer l'ID du pet
  document.querySelector(".form-content").dataset.id = el.dataset.id
  // Récupérer le nom de l'animal de la carte sur laquelle on a cliqué
  document.querySelector(".form-photo p strong").textContent = el.closest(".pet-card").querySelector(".pet-name").textContent.trim() + "."
  // Configurer l'image
  document.querySelector(".form-photo img").src = el.closest(".pet-card").querySelector(".pet-card-photo img").src
  // Afficher l'overlay
  document.querySelector(".form-overlay").classList.add("form-overlay--is-visible")
  // Empêcher le scroll de la page en arrière-plan
  document.querySelector(":root").style.overflowY = "hidden"
}

// Fermer l'overlay
document.querySelector(".close-form-overlay").addEventListener("click", closeOverlay)

function closeOverlay() {
  document.querySelector(".form-overlay").classList.remove("form-overlay--is-visible")
  // Réactiver le scroll de la page en arrière-plan
  document.querySelector(":root").style.overflowY = ""
}

/*
 * Soumission du formulaire - Créer un objet qui sera envoyé au serveur
 */

document.querySelector(".form-content").addEventListener("submit", async function (e) {
  e.preventDefault()

  // créer objet contenant les données saisies dans le form qui sera envoyé au serveur
  const userValues = {
    petId: e.target.dataset.id,
    name: document.querySelector("#name").value,
    email: document.querySelector("#email").value,
    secret: document.querySelector("#secret").value,
    comment: document.querySelector("#comment").value
  }

  console.log(userValues)

  // envoyer les données au serveur
  fetch("/submit-contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userValues)
  })

  // afficher message de remerciement
  document.querySelector(".thank-you").classList.add("thank-you--visible")

  // fermer l'overlay du message automatiquement après 2.5sec
  setTimeout(closeOverlay, 2500)
  // supprimer la class --visible et vider les champs du form 400ms après fermeture de l'overlay
  setTimeout(() => {
    document.querySelector(".thank-you").classList.remove("thank-you--visible")
    document.querySelector("#name").value = ""
    document.querySelector("#email").value = ""
    document.querySelector("#secret").value = ""
    document.querySelector("#comment").value = ""
  }, 2900)
})











