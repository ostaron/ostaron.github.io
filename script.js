function showHideDesc () {
  const target = this.nextElementSibling;
  target.classList.toggle("hidden");
}

const portfolioLinks = document.querySelectorAll("h3");

portfolioLinks.forEach(function(link) {
    link.addEventListener("click", showHideDesc);
})