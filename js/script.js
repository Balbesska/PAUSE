
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');

  sidebar.classList.toggle('open');
  overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';

  if (sidebar.classList.contains('open')) {
      document.addEventListener('click', closeSidebarOutside);
  } else {
      document.removeEventListener('click', closeSidebarOutside);
  }

  function closeSidebarOutside(event) {
      if (!event.target.closest('#sidebar') && !event.target.closest('#menu-button')) {
          sidebar.classList.remove('open');
          overlay.style.display = 'none';
          document.removeEventListener('click', closeSidebarOutside);
      }
  }
}

document.getElementById('menu-button').addEventListener('click', toggleSidebar);

document.addEventListener('DOMContentLoaded', function() {
  var overlay = document.getElementById('overlay');

  overlay.addEventListener('click', function() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('open');
    overlay.style.display = 'none';
  });
});


async function loadBootstrap() {
    await import('https://code.jquery.com/jquery-3.5.1.slim.min.js');
    await import('https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.1/dist/umd/popper.min.js');
    //await import('https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js');
}

loadBootstrap();
document.getElementById('menu-button').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.toggle('open');
});
document.addEventListener('DOMContentLoaded', function() {
    var images = document.getElementsByTagName('img');
    for(var i = 0; i < images.length; i++) {
        images[i].style.outline = 'none';
    }
});

const carousel = document.querySelector('.carousel');
let isAutomatedScrolling = false;

window.addEventListener('scroll', () => {
  if (!isAutomatedScrolling) {
    const windowHeight = window.innerHeight;
    const carouselTop = carousel.getBoundingClientRect().top;

    if (carouselTop < windowHeight / 2 && carouselTop > -carousel.offsetHeight + windowHeight / 2) {
      isAutomatedScrolling = true;
      startAutomaticScroll();
    } else {
      isAutomatedScrolling = false;
    }
  }
});

function startAutomaticScroll() {
  let currentPosition = carousel.scrollLeft;
  let destination = carousel.scrollLeft + carousel.offsetWidth;

  const scrollInterval = setInterval(() => {
    carousel.scrollLeft += 10;

    if (carousel.scrollLeft >= destination) {
      clearInterval(scrollInterval);
    }
  }, 10);
}

document.getElementById("loginToggleBtn").addEventListener("click", function() {
  document.getElementById("registrationForm").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
});

document.getElementById("registerToggleBtn").addEventListener("click", function() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registrationForm").style.display = "block";
});

