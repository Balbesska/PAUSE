
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');

  sidebar.classList.toggle('open');


  if (sidebar.classList.contains('open')) {
      document.addEventListener('click', closeSidebarOutside);
  } else if (sidebar.classList.contains('close')) {
      document.removeEventListener('click', closeSidebarOutside);
  }

  function closeSidebarOutside(event) {
      if (!event.target.closest('#sidebar') && !event.target.closest('#close-button')) {
          sidebar.classList.remove('open');
      }
  }
}

document.getElementById('menu-button').addEventListener('click', function() {
  document.querySelector('.sidebar').classList.toggle('open');
});
document.getElementById('close-button').addEventListener('click', function() {
  sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('open');
});


async function loadBootstrap() {
    await import('https://code.jquery.com/jquery-3.5.1.slim.min.js');
    await import('https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.1/dist/umd/popper.min.js');
}

loadBootstrap();

document.addEventListener('DOMContentLoaded', function() {
    var images = document.getElementsByTagName('img');
    for(var i = 0; i < images.length; i++) {
        images[i].style.outline = 'none';
    }
});

const carousel = document.querySelector('.carousel');
let isAutomatedScrolling = false;


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
