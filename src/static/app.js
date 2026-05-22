document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const summaryButton = document.getElementById("summary-button");
  const summaryContainer = document.getElementById("summary-container");
  const messageDiv = document.getElementById("message");
  let cachedActivities = {};

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();
      cachedActivities = activities;

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  function renderSummary() {
    summaryContainer.innerHTML = "";

    if (!cachedActivities || Object.keys(cachedActivities).length === 0) {
      summaryContainer.innerHTML = "<p>No activity data available for summary.</p>";
      return;
    }

    const summaryList = document.createElement("div");
    summaryList.className = "summary-list";

    Object.entries(cachedActivities).forEach(([name, details]) => {
      const activitySummary = document.createElement("div");
      activitySummary.className = "summary-item";

      const title = document.createElement("h4");
      title.textContent = name;

      const participantsList = document.createElement("ul");

      if (details.participants.length > 0) {
        details.participants.forEach((participant) => {
          const listItem = document.createElement("li");
          listItem.textContent = participant;
          participantsList.appendChild(listItem);
        });
      } else {
        const listItem = document.createElement("li");
        listItem.textContent = "No participants signed up yet.";
        participantsList.appendChild(listItem);
      }

      activitySummary.appendChild(title);
      activitySummary.appendChild(participantsList);
      summaryList.appendChild(activitySummary);
    });

    summaryContainer.appendChild(summaryList);
  }

  summaryButton.addEventListener("click", () => {
    renderSummary();
    const isHidden = summaryContainer.classList.toggle("hidden");
    summaryButton.textContent = isHidden ? "Show Participant Summary" : "Hide Participant Summary";
  });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = `${result.message} Reloading page...`;
        messageDiv.className = "success";
        signupForm.reset();

        // Reload the full page after successful signup
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
