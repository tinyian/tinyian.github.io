/* Theme */

const toggleThemeBtn = document.querySelector('#theme');

toggleThemeBtn.addEventListener('click', function() {
    
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    const newTheme = currentTheme === 'dark' ? 'light' : currentTheme === 'light' ? 'dark' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    
    var x = document.getElementById("moon");
    var y = document.getElementById("sun");
    var z = document.getElementById("logo-light");
    var a = document.getElementById("logo-dark");
    var b = document.getElementById("login-light");
    var c = document.getElementById("login-dark");
   
    
    if (x.style.display === "none") {
      x.style.display = "grid";
      y.style.display = "none";
        z.style.display = "none";
        a.style.display = "block";
        b.style.display = "none";
        c.style.display = "block";
        
    } else {
      x.style.display = "none";
      y.style.display = "grid";
        z.style.display = "block";
        a.style.display = "none";
        b.style.display = "block";
        c.style.display = "none";
    }
})

/* Font Awesome */

const script = document.createElement("script");

script.src = "https://kit.fontawesome.com/1ee8f271b9.js";

document.body.appendChild(script);

/* Scroll Animation */

const pages = document.querySelectorAll('.page')

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        entry.target.classList.toggle("show", entry.isIntersecting)
        if (entry.isIntersecting) observer.unobserve(entry.target)
    })
    console.log(entries)
    },
    {
        threshold: 0.25,
    }
)


pages.forEach(page => {
    observer.observe(page)
})

//blob

const blob = document.getElementById("blob");

document.body.onpointermove = event => {
  const { clientX, clientY } = event;
  
  blob.animate({
    left: `${clientX}px`,
    top: `${clientY}px`
  }, { duration: 3000, fill: "forwards" });
}

//share
function shareOnSocialMedia(platform) {
var url = ''; // Set the URL of your website's content

switch (platform) {
  case 'facebook':
    url = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
    break;
  case 'twitter':
    url = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url);
    break;
  case 'instagram':
    url = 'https://www.instagram.com/' + encodeURIComponent(url);
    break;
  case 'copy':
    url = 'http://users.sussex.ac.uk/~io202/dissertation/client/public/index.html' + encodeURIComponent(url);
    break;
  // Add cases for other platforms
}

window.open(url, '_blank', 'width=600,height=400');
}

// Attach click event listeners to buttons
document.getElementById('facebook-button').addEventListener('click', function() {
shareOnSocialMedia('facebook');
});

document.getElementById('twitter-button').addEventListener('click', function() {
shareOnSocialMedia('twitter');
});

document.getElementById('instagram-button').addEventListener('click', function() {
shareOnSocialMedia('instagram');
});

document.getElementById('copy-button').addEventListener('click', function() {
shareOnSocialMedia('copy');
});
