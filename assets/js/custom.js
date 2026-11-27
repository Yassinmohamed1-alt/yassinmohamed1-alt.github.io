document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");

  if (!form) {
    return;
  }

  const submitButton = document.getElementById("submitButton");
  const clearButton = document.getElementById("clearButton");
  const resultBox = document.getElementById("formResult");

  const fieldNames = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "address",
    "rating1",
    "rating2",
    "rating3"
  ];

  const labels = {
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone number",
    address: "Address",
    rating1: "Design rating",
    rating2: "Content rating",
    rating3: "Navigation rating"
  };

  function validateRating(value) {
    if (value === "") {
      return "This rating is required.";
    }

    const number = Number(value);

    if (!Number.isInteger(number) || number < 1 || number > 10) {
      return "Enter a whole number from 1 to 10.";
    }

    return "";
  }

  const validators = {
    firstName: function (value) {
      if (value === "") {
        return "First name is required.";
      }

      if (!/^\p{L}+$/u.test(value)) {
        return "Use letters only.";
      }

      return "";
    },
    lastName: function (value) {
      if (value === "") {
        return "Last name is required.";
      }

      if (!/^\p{L}+$/u.test(value)) {
        return "Use letters only.";
      }

      return "";
    },
    email: function (value) {
      if (value === "") {
        return "Email address is required.";
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Enter a valid email address.";
      }

      return "";
    },
    phone: function (value) {
      if (value === "" || value === "+370") {
        return "Phone number is required.";
      }

      if (!/^\+370 6\d{2} \d{5}$/.test(value)) {
        return "Use the format +370 6xx xxxxx.";
      }

      return "";
    },
    address: function (value) {
      if (value === "") {
        return "Address is required.";
      }

      return "";
    },
    rating1: validateRating,
    rating2: validateRating,
    rating3: validateRating
  };

  function getValue(name) {
    return form.elements[name].value.trim();
  }

  function showError(name, message) {
    const field = form.elements[name];
    const errorElement = document.getElementById(name + "Error");

    errorElement.textContent = message;
    field.classList.toggle("is-invalid", message !== "");
    field.setAttribute("aria-invalid", message !== "" ? "true" : "false");
  }

  function validateField(name, display) {
    const message = validators[name](getValue(name));

    if (display) {
      showError(name, message);
    }

    return message === "";
  }

  function updateSubmitState() {
    const allValid = fieldNames.every(function (name) {
      return validators[name](getValue(name)) === "";
    });

    submitButton.disabled = !allValid;
  }

  function formatPhone(value) {
    let digits = value.replace(/\D/g, "");

    if (digits === "") {
      return "";
    }

    if ("370".startsWith(digits)) {
      return "+370";
    }

    if (digits.startsWith("370")) {
      digits = digits.slice(3);
    }

    digits = digits.slice(0, 8);

    let result = "+370";

    if (digits.length > 0) {
      result += " " + digits.slice(0, 3);
    }

    if (digits.length > 3) {
      result += " " + digits.slice(3);
    }

    return result;
  }

  function renderResult(data, average) {
    resultBox.textContent = "";

    const heading = document.createElement("h3");
    heading.textContent = "Submitted data";
    resultBox.appendChild(heading);

    Object.keys(data).forEach(function (key) {
      const line = document.createElement("div");
      line.className = "result-line";
      line.textContent = labels[key] + ": " + data[key];
      resultBox.appendChild(line);
    });

    const averageLine = document.createElement("div");
    averageLine.className = "result-line result-average";
    averageLine.textContent = data.firstName + " " + data.lastName + ": " + average.toFixed(2);
    resultBox.appendChild(averageLine);

    resultBox.hidden = false;
  }

  fieldNames.forEach(function (name) {
    const field = form.elements[name];

    field.addEventListener("input", function () {
      if (name === "phone") {
        field.value = formatPhone(field.value);
      }

      validateField(name, true);
      updateSubmitState();
    });

    field.addEventListener("blur", function () {
      validateField(name, true);
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let formIsValid = true;

    fieldNames.forEach(function (name) {
      if (!validateField(name, true)) {
        formIsValid = false;
      }
    });

    if (!formIsValid) {
      updateSubmitState();
      return;
    }

    const data = {
      firstName: getValue("firstName"),
      lastName: getValue("lastName"),
      email: getValue("email"),
      phone: getValue("phone"),
      address: getValue("address"),
      rating1: Number(getValue("rating1")),
      rating2: Number(getValue("rating2")),
      rating3: Number(getValue("rating3"))
    };

    console.log(data);

    const average = (data.rating1 + data.rating2 + data.rating3) / 3;

    renderResult(data, average);
  });

  clearButton.addEventListener("click", function () {
    form.reset();

    fieldNames.forEach(function (name) {
      showError(name, "");
    });

    resultBox.textContent = "";
    resultBox.hidden = true;
    submitButton.disabled = true;
    form.elements.firstName.focus();
  });

  submitButton.disabled = true;
});
document.addEventListener("DOMContentLoaded", function () {
  const board = document.getElementById("kanbanBoard");

  if (!board) {
    return;
  }

  const STORAGE_KEY = "cvSkillStatuses";
  const STATUSES = ["Planned", "In Progress", "Completed"];

  const columns = {
    "Planned": { list: "listPlanned", count: "countPlanned", badge: "status-planned" },
    "In Progress": { list: "listInProgress", count: "countInProgress", badge: "status-progress" },
    "Completed": { list: "listCompleted", count: "countCompleted", badge: "status-completed" }
  };

  const levels = [
    { level: 1, min: 0, next: 50, rank: "Beginner" },
    { level: 2, min: 50, next: 150, rank: "Trainee" },
    { level: 3, min: 150, next: 300, rank: "Specialist" },
    { level: 4, min: 300, next: null, rank: "Professional" }
  ];

  const defaultSkills = [
    { name: "Accessibility", icon: "bi-eye", status: "Planned", xp: 45 },
    { name: "Web APIs", icon: "bi-globe", status: "Planned", xp: 30 },
    { name: "JavaScript Basics", icon: "bi-braces", status: "In Progress", xp: 70 },
    { name: "Responsive Design", icon: "bi-phone", status: "In Progress", xp: 55 },
    { name: "Bootstrap", icon: "bi-bootstrap", status: "In Progress", xp: 40 },
    { name: "HTML Structure", icon: "bi-code-slash", status: "Completed", xp: 60 },
    { name: "CSS Layout", icon: "bi-palette", status: "Completed", xp: 70 },
    { name: "Git and GitHub", icon: "bi-github", status: "Completed", xp: 50 }
  ];

  function loadSkills() {
    const skills = defaultSkills.map(function (skill) {
      return Object.assign({}, skill);
    });

    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return skills;
      }

      const saved = JSON.parse(raw);

      if (!saved || typeof saved !== "object") {
        return skills;
      }

      skills.forEach(function (skill) {
        if (STATUSES.includes(saved[skill.name])) {
          skill.status = saved[skill.name];
        }
      });
    } catch (error) {
      return defaultSkills.map(function (skill) {
        return Object.assign({}, skill);
      });
    }

    return skills;
  }

  function saveSkills(skills) {
    const saved = {};

    skills.forEach(function (skill) {
      saved[skill.name] = skill.status;
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch (error) {
      console.warn("Skill statuses could not be saved.");
    }
  }

  let skills = loadSkills();

  function getCompletedXp() {
    return skills.reduce(function (sum, skill) {
      return skill.status === "Completed" ? sum + skill.xp : sum;
    }, 0);
  }

  function getLevelInfo(xp) {
    let current = levels[0];

    levels.forEach(function (item) {
      if (xp >= item.min) {
        current = item;
      }
    });

    return current;
  }

  function createCard(skill) {
    const card = document.createElement("article");
    card.className = "kanban-card";

    const top = document.createElement("div");
    top.className = "kanban-card-top";

    const icon = document.createElement("i");
    icon.className = "bi " + skill.icon;

    const title = document.createElement("h5");
    title.textContent = skill.name;

    top.appendChild(icon);
    top.appendChild(title);

    const bottom = document.createElement("div");
    bottom.className = "kanban-card-bottom";

    const badge = document.createElement("span");
    badge.className = "status-badge " + columns[skill.status].badge;
    badge.textContent = skill.status;

    const xpBadge = document.createElement("span");
    xpBadge.className = "xp-badge";
    xpBadge.textContent = skill.xp + " XP";

    bottom.appendChild(badge);
    bottom.appendChild(xpBadge);

    const select = document.createElement("select");
    select.className = "status-select";
    select.setAttribute("aria-label", "Change status of " + skill.name);
    select.dataset.skill = skill.name;

    STATUSES.forEach(function (status) {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      option.selected = status === skill.status;
      select.appendChild(option);
    });

    select.addEventListener("change", function () {
      changeStatus(skill.name, select.value);
    });

    card.appendChild(top);
    card.appendChild(bottom);
    card.appendChild(select);

    return card;
  }

  function renderBoard() {
    const counts = { "Planned": 0, "In Progress": 0, "Completed": 0 };

    STATUSES.forEach(function (status) {
      document.getElementById(columns[status].list).textContent = "";
    });

    skills.forEach(function (skill) {
      document.getElementById(columns[skill.status].list).appendChild(createCard(skill));
      counts[skill.status] += 1;
    });

    STATUSES.forEach(function (status) {
      const total = counts[status];
      document.getElementById(columns[status].count).textContent = total + (total === 1 ? " skill" : " skills");
    });
  }

  function updateSummary(xp, info) {
    document.getElementById("totalXp").textContent = xp + " XP";
    document.getElementById("levelValue").textContent = "Level " + info.level;
    document.getElementById("rankValue").textContent = info.rank;
  }

  function updateProgressBar(xp, info) {
    const fill = document.getElementById("xpFill");
    const track = document.getElementById("xpTrack");
    const text = document.getElementById("xpProgressText");
    const scaleStart = document.getElementById("xpScaleStart");
    const scaleEnd = document.getElementById("xpScaleEnd");

    let percent = 100;

    if (info.next === null) {
      text.textContent = "100% (maximum level reached)";
      scaleStart.textContent = "Level " + info.level + ": " + info.min + " XP";
      scaleEnd.textContent = "Maximum level";
    } else {
      percent = Math.round(((xp - info.min) / (info.next - info.min)) * 100);
      text.textContent = percent + "% (" + xp + " / " + info.next + " XP)";
      scaleStart.textContent = "Level " + info.level + ": " + info.min + " XP";
      scaleEnd.textContent = "Level " + (info.level + 1) + ": " + info.next + " XP";
    }

    fill.style.width = percent + "%";
    track.setAttribute("aria-valuenow", String(percent));
  }

  function updateStatistics() {
    const total = skills.length;
    const completed = skills.filter(function (skill) {
      return skill.status === "Completed";
    }).length;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById("statTotal").textContent = String(total);
    document.getElementById("statCompleted").textContent = String(completed);
    document.getElementById("statRate").textContent = rate + "%";
  }

  function updateModule() {
    const xp = getCompletedXp();
    const info = getLevelInfo(xp);

    renderBoard();
    updateSummary(xp, info);
    updateProgressBar(xp, info);
    updateStatistics();
  }

  function changeStatus(name, status) {
    const skill = skills.find(function (item) {
      return item.name === name;
    });

    if (!skill || !STATUSES.includes(status)) {
      return;
    }

    skill.status = status;
    saveSkills(skills);
    updateModule();

    const select = board.querySelector('select[data-skill="' + CSS.escape(name) + '"]');

    if (select) {
      select.focus();
    }
  }

  updateModule();
});