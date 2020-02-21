$(document)
  .off("click", ".accordion")
  .on("click", ".accordion", function() {
    var acc = document.getElementsByClassName("accordion");
    var panels = document.getElementsByClassName("panel");
    var i;
    var m;

    for (i = 0; i < acc.length; i++) {
      acc[i].classList.remove("active");
    }

    this.classList.toggle("active");

    var panel = this.nextElementSibling;

    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
      this.classList.remove("active");
    } else {
      for (m = 0; m < panels.length; m++) {
        panels[m].style.maxHeight = null;
      }
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });

/* ne stavljam off jer se ovaj deo ne ucitava ponovo  */

$(document).on("click", "#komitenti", function() {
  var komitenti_dugme = $(this);
  $.ajax({
    url: "/komitenti",
    type: "get",
    data: { "": "" },
    /*dataType: "script",*/
    dataType: "html",
    complete: function() {
      komitenti_dugme.data("requestRunning", false);
    },
    success: function(html) {
      $("div.centar").html(html);
    }
  });
});
$(document).on("click", "#kontni_plan", function() {
  var kontni_plan_dugme = $(this);
  $.ajax({
    url: "/kontni_plan",
    type: "get",
    data: { "": "" },
    /*dataType: "script",*/
    dataType: "html",
    complete: function() {
      kontni_plan_dugme.data("requestRunning", false);
    },
    success: function(html) {
      $("div.centar").html(html);
    }
  });
});
$(document).on("click", "#dnevnik_naloga", function() {
  var dnevnik_naloga_dugme = $(this);
  $.ajax({
    url: "/dnevnik_naloga",
    type: "get",
    data: { "": "" },
    dataType: "html",
    complete: function() {
      dnevnik_naloga_dugme.data("requestRunning", false);
    },
    success: function(html) {
      $("div.centar").html(html);
    }
  });
});
$(document).on("click", "#tok_dokumentacije", function() {
  window.location.reload();
});
$(document).on("click", "#zakljucni", function() {
  $.ajax({
    url: "/zakljucni_list",
    type: "get",
    data: { "": "" },
    dataType: "script"
  });
});
$(document).on("click", "#zakljucni_list_trocifreni", function() {
  $.ajax({
    url: "/zakljucni_list_trocifreni",
    type: "get",
    data: { "": "" },
    dataType: "script"
  });
});
$(document).on("click", "#overview_button", function() {
  $.ajax({
    url: "/overview",
    type: "get",
    data: { "": "" },
    dataType: "script"
  });
});
