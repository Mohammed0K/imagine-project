(function () {
  "use strict";

  // ----- Data (temporary) -----
  var guides = [
    {
      id: 1,
      name: "Ali Al-Qahtani",
      region: "Riyadh",
      languages: ["Arabic", "English"],
      rating: 4.8,
      bio: "Experienced guide specializing in historical tours around Diriyah.",
      reviews: [
        { user: "John Smith", text: "Ali was super knowledgeable and friendly!" },
        { user: "Fatimah", text: "Amazing experience, highly recommend." }
      ],
      image: "../places/assets/riyadh-guide.jpg"
    },
    {
      id: 2,
      name: "Sara Al-Fahad",
      region: "AlUla",
      languages: ["Arabic", "French"],
      rating: 4.9,
      bio: "Expert in heritage sites and desert adventures in AlUla.",
      reviews: [{ user: "Marie Dupont", text: "Great tour in perfect French!" }],
      image: "../places/assets/alula-guide.jpg"
    },
    {
      id: 3,
      name: "Faisal Al-Dosari",
      region: "Jeddah",
      languages: ["Arabic", "English"],
      rating: 4.7,
      bio: "Marine and coastal tourism specialist at the Red Sea.",
      reviews: [{ user: "Ahmed", text: "Wonderful sea trip!" }],
      image: "../places/assets/jeddah-guide.jpg"
    }
  ];

  // ----- Utils -----
  function getQueryId() {
    var params = new URLSearchParams(window.location.search);
    var idStr = params.get("id");
    var idNum = parseInt(idStr, 10);
    return isNaN(idNum) ? null : idNum;
  }

  function el(tag, className, text) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (typeof text === "string") e.textContent = text;
    return e;
  }

  // ----- Render -----
  window.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("details-root");
    if (!root) return;

    var guideId = getQueryId();
    var guide = guides.find(function (g) { return g.id === guideId; });

    if (!guide) {
      var msg = el("p", "warning", "Guide not found.");
      root.appendChild(msg);
      return;
    }

    var loggedIn = localStorage.getItem("touristLoggedIn");

    var card = el("div", "details-card fade-in");
    var imgBox = el("div", "image-box");
    var img = el("img");
    img.src = guide.image;
    img.alt = guide.name;
    imgBox.appendChild(img);

    var info = el("div", "info");
    var h2 = el("h2", null, guide.name);

    var pRegion = el("p");
    pRegion.innerHTML = "<strong>Region:</strong> " + guide.region;

    var pLang = el("p");
    pLang.innerHTML = "<strong>Languages:</strong> " + guide.languages.join(", ");

    var pRating = el("p");
    pRating.innerHTML = '<strong>Rating:</strong> <i class="fa-solid fa-star"></i> ' + guide.rating;

    var pBio = el("p", "bio", guide.bio);

    var h3 = el("h3", null, "Reviews");
    var ul = el("ul", "reviews");
    guide.reviews.forEach(function (r) {
      var li = el("li");
      li.innerHTML = "<strong>" + r.user + ":</strong> " + r.text;
      ul.appendChild(li);
    });

    info.appendChild(h2);
    info.appendChild(pRegion);
    info.appendChild(pLang);
    info.appendChild(pRating);
    info.appendChild(pBio);
    info.appendChild(h3);
    info.appendChild(ul);

    if (loggedIn) {
      var btn = el("button", "btn", "Book Now");
      btn.addEventListener("click", function () {
        alert("✅ Booking request sent to " + guide.name + "!");
      });
      info.appendChild(btn);
    } else {
      var warn = el("p", "warning");
      warn.innerHTML = '⚠️ You must <a href="../login/login.html">log in</a> to book this guide.';
      info.appendChild(warn);
    }

    card.appendChild(imgBox);
    card.appendChild(info);
    root.appendChild(card);
  });
})();
