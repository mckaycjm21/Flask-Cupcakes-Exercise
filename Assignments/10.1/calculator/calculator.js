window.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById("calc-form");
  if (form) {
    setupIntialValues();
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      update();
    });
  }
});

function getCurrentUIValues() {
  return {
    amount: +(document.getElementById("loan-amount").value),
    years: +(document.getElementById("loan-years").value),
    rate: +(document.getElementById("loan-rate").value),
  }
}

// Get the inputs from the DOM.
// Put some default values in the inputs
// Call a function to calculate the current monthly payment
function setupIntialValues() {
  document.getElementById("loan-amount").value = 25000;
  document.getElementById("loan-years").value = 30;
  document.getElementById("loan-rate").value = 3;
  update();
}

// Get the current values from the UI
// Update the monthly payment
function update() {
  const currentValueUI = getCurrentUIValues();
  updateMonthly(calculateMonthlyPayment(currentValueUI));
}

// Given an object of values (a value has amount, years and rate ),
// calculate the monthly payment.  The output should be a string
// that always has 2 decimal places.
function calculateMonthlyPayment(userValues) {
  const monthRate = (userValues.rate / 100) / 12;
  const monthlyTerm = userValues.years * 12;
  return (
    (monthRate * userValues.amount) /
    (1 - Math.pow((1 + monthRate), -monthlyTerm))
  ).toFixed(2);
}

// Given a string representing the monthly payment value,
// update the UI to show the value.
function updateMonthly(monthly) {
  const monthlyUser = document.getElementById("monthly-payment");
  monthlyUser.innerText = "$" + monthly;
}
