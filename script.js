const callConnection     = document.getElementById("callConnection");
const connectedResponse  = document.getElementById("connectedResponse");
const reasonNotConnected = document.getElementById("reasonNotConnected");
const notInterested      = document.getElementById("notInterested");
const nextCall           = document.getElementById("nextCall");
const nextDate           = document.getElementById("nextDate");
const remarks            = document.getElementById("remarks");
const requirement        = document.getElementById("requirement");

// helper to show/hide elements cleanly
function show(el) { el.style.display = "block"; }
function hide(el) { el.style.display = "none"; }

// 1. call connection
callConnection.addEventListener("change", function() {
    if (this.value === "connected") {
        show(connectedResponse);
        hide(reasonNotConnected);
    } else if (this.value === "not connected") {
        hide(connectedResponse);
        show(reasonNotConnected);
        // reset connected sub-sections when switching back
        hide(nextCall);
        hide(nextDate);
        hide(notInterested);
        hide(requirement);
    }
});

// ── 2. reason not connected ──
reasonNotConnected.addEventListener("change", function() {
    this.value === "other" ? show(remarks) : hide(remarks);
});

// ── 3. connected response ──
connectedResponse.addEventListener("change", function() {
    // reset all sub-sections first, then show only what's needed
    hide(notInterested);
    hide(requirement);
    show(nextCall);
    show(nextDate);

    // reset all options visibility first
    Array.from(nextCall.options).forEach(opt => opt.style.display = "block");

    if (this.value === "not interested") {
        hide(nextCall);
        hide(nextDate);
        show(notInterested);

    } else if (this.value === "interested") {
        // all options visible — already reset above

    } else if (this.value === "busy" || this.value === "details shared") {
        // hide "appointment" option (index 0), keep "follow up" (index 1)
        nextCall.options[1].style.display = "none";
    }
});

// ── 4. not interested reason ──
notInterested.addEventListener("change", function() {
    if (this.value === "requirement not matched") {
        show(requirement);
        hide(remarks);
    } else if (this.value === "other") {
        hide(requirement);
        show(remarks);
    } else {
        hide(requirement);
        hide(remarks);
    }
});

// Google sheet code

document.addEventListener("DOMContentLoaded", function() {
	scriptURL ="https://script.google.com/macros/s/AKfycbx0dgD3chPJr7bU-v1wo0TaEbY-WU1bQ6nclJTMpV8Fnmpl6TTVOmXcZgLrIrZfI16AIQ/exec";
	form = document.forms[0];
	
	function afterSubmit() {
		form.reset();
		location.reload();
	}
	form.addEventListener("submit", (e) => {
		e.preventDefault();
		// after submit
		fetch(scriptURL, { method: "POST", body: new FormData(form) })
		.then((response) => {
			console.log("Thank You");
			afterSubmit();
		})
		.catch((error) => {
			console.error("Error!", error.message);
// Additional function call if there's an error with the fetch
		});
	});
});