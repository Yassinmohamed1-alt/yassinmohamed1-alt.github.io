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