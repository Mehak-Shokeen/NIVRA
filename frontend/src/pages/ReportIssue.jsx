import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationPicker from "../components/LocationPicker";
import api from "../services/api";
import "./ReportIssue.css";

const categories = [
  {
    value: "POTHOLE",
    icon: "🛣️",
    label: "Pothole",
    description: "Road damage or potholes",
  },
  {
    value: "STREETLIGHT",
    icon: "💡",
    label: "Streetlight",
    description: "Broken or missing streetlight",
  },
  {
    value: "GARBAGE",
    icon: "🗑️",
    label: "Garbage",
    description: "Garbage accumulation",
  },
  {
    value: "SIDEWALK",
    icon: "🚶",
    label: "Sidewalk",
    description: "Damaged or blocked sidewalk",
  },
  {
    value: "TRAFFIC_SIGNAL",
    icon: "🚦",
    label: "Traffic Signal",
    description: "Broken traffic signal",
  },
  {
    value: "WATER_LEAKAGE",
    icon: "💧",
    label: "Water Leakage",
    description: "Water leakage or flooding",
  },
  {
    value: "ILLEGAL_DUMPING",
    icon: "⚠️",
    label: "Illegal Dumping",
    description: "Unauthorized waste dumping",
  },
  {
    value: "PUBLIC_PROPERTY",
    icon: "🏗️",
    label: "Public Property",
    description: "Damaged public property",
  },
];

const priorities = [
  {
    value: "LOW",
    label: "Low",
    description: "Minor issue",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    description: "Needs attention",
  },
  {
    value: "HIGH",
    label: "High",
    description: "Urgent issue",
  },
];

const steps = [
  "Issue Details",
  "Location",
  "Photo",
  "Submit",
];

function ReportIssue() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "MEDIUM",
  });

  const [error, setError] = useState("");
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleCategorySelect = (category) => {
    setFormData((previous) => ({
      ...previous,
      category,
    }));

    setError("");
  };

  const handlePrioritySelect = (priority) => {
    setFormData((previous) => ({
      ...previous,
      priority,
    }));

    setError("");
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setPhoto(file);

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return previewUrl;
    });

    event.target.value = "";
  };

  const handleRemovePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhoto(null);
    setPhotoPreview(null);
    setError("");
  };

  const validatePhoto = () => {
    if (photo && photo.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return false;
    }

    return true;
  };

  const validateDetails = () => {
    if (!formData.title.trim()) {
      setError("Please enter a title for the issue.");
      return false;
    }

    if (!formData.category) {
      setError("Please select an issue category.");
      return false;
    }

    if (!formData.description.trim()) {
      setError("Please describe the issue.");
      return false;
    }

    if (formData.description.trim().length < 10) {
      setError("Please provide a little more detail about the issue.");
      return false;
    }

    return true;
  };

  const validateLocation = () => {
    if (!location) {
      setError("Please select the issue location on the map.");
      return false;
    }

    return true;
  };

  const goToLocation = () => {
    setError("");

    if (!validateDetails()) {
      return;
    }

    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPhoto = () => {
    setError("");

    if (!validateLocation()) {
      return;
    }

    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToSubmit = () => {
    setError("");

    if (!validatePhoto()) {
      return;
    }

    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setError("");

    if (currentStep === 1) {
      navigate("/dashboard");
      return;
    }

    setCurrentStep((previous) => previous - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");

    if (!validateDetails()) {
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!validateLocation()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!validatePhoto()) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create the issue first so the backend gives us an issue ID.
      const issueResponse = await api.post("/issues", {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      const createdIssue = issueResponse.data;
      const issueId = createdIssue?.id ?? createdIssue?.issueId;

      if (!issueId) {
        throw new Error(
          "Issue was created, but the server did not return an issue ID."
        );
      }

      // 2. Upload the optional photo using the newly-created issue ID.
      if (photo) {
        const imageData = new FormData();
        imageData.append("file", photo);

        await api.post(`/issues/${issueId}/image`, imageData);
      }

      console.log("Report submitted successfully:", {
        issueId,
        ...formData,
        location,
        photo: photo?.name || null,
      });

      alert("Your civic issue has been reported successfully! 🎉");
      navigate("/dashboard");
    } catch (submissionError) {
      console.error("Report submission failed:", submissionError);

      const serverMessage =
        submissionError.response?.data?.message ||
        submissionError.response?.data?.error;

      setError(
        serverMessage ||
          "Something went wrong while submitting the report. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find(
    (category) => category.value === formData.category
  );

  const selectedPriority = priorities.find(
    (priority) => priority.value === formData.priority
  );

  return (
    <div className="report-page">
      <div className="report-header">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <div className="report-title-block">
          <div className="report-badge">CIVIC REPORT</div>

          <h1>Report an Issue</h1>

          <p>
            Help make your community safer, cleaner and better.
          </p>
        </div>
      </div>

      <div className="report-progress">
        {steps.map((step, index) => {
          const stepNumber = index + 1;

          return (
            <span key={step} style={{ display: "contents" }}>
              <div
                className={`progress-step ${
                  currentStep === stepNumber ? "active" : ""
                }`}
              >
                <div className="progress-number">
                  {stepNumber}
                </div>
                <span>{step}</span>
              </div>

              {stepNumber < steps.length && (
                <div className="progress-line"></div>
              )}
            </span>
          );
        })}
      </div>

      <div className="report-content">
        <form className="report-form" onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <div className="form-section">
              <div className="section-heading">
                <div>
                  <h2>What is the issue?</h2>
                  <p>
                    Give us enough information to understand the problem.
                  </p>
                </div>

                <span className="required-note">
                  * Required
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="title">
                  Issue Title <span>*</span>
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  maxLength={100}
                  placeholder="e.g. Large pothole near the main road"
                  value={formData.title}
                  onChange={handleChange}
                />

                <div className="input-hint">
                  Give the issue a short, clear title.
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label>
                    Category <span>*</span>
                  </label>

                  <span className="selection-hint">
                    Select one
                  </span>
                </div>

                <div className="category-grid">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      className={`category-card ${
                        formData.category === category.value
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleCategorySelect(category.value)
                      }
                    >
                      <div className="category-icon">
                        {category.icon}
                      </div>

                      <div className="category-text">
                        <strong>{category.label}</strong>
                        <span>{category.description}</span>
                      </div>

                      <div className="category-check">
                        {formData.category === category.value
                          ? "✓"
                          : ""}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label>
                    Priority <span>*</span>
                  </label>

                  <span className="selection-hint">
                    How urgent is this?
                  </span>
                </div>

                <div className="priority-grid">
                  {priorities.map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      className={`priority-card ${
                        formData.priority === priority.value
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handlePrioritySelect(priority.value)
                      }
                    >
                      <div className="priority-radio">
                        {formData.priority === priority.value
                          ? "●"
                          : "○"}
                      </div>

                      <div>
                        <strong>{priority.label}</strong>
                        <span>{priority.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="description">
                    Description <span>*</span>
                  </label>

                  <span className="character-count">
                    {formData.description.length}/500
                  </span>
                </div>

                <textarea
                  id="description"
                  name="description"
                  rows="6"
                  maxLength={500}
                  placeholder="Describe what you noticed, how serious it is, and any useful details about the problem..."
                  value={formData.description}
                  onChange={handleChange}
                />

                <div className="input-hint">
                  More details help authorities understand and resolve
                  the issue faster.
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="form-section">
              <div className="section-heading">
                <div>
                  <h2>Where is the issue?</h2>
                  <p>
                    Pin the exact location so authorities know where to
                    respond.
                  </p>
                </div>

                <span className="required-note">
                  * Required
                </span>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label>
                    Location <span>*</span>
                  </label>

                  <span className="selection-hint">
                    Click the map or use your current location
                  </span>
                </div>

                <LocationPicker
                  location={location}
                  onLocationChange={(newLocation) => {
                    setLocation(newLocation);
                    setError("");
                  }}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="form-section">
              <div className="section-heading">
                <div>
                  <h2>Add a photo</h2>
                  <p>
                    A photo helps authorities understand and verify the
                    issue.
                  </p>
                </div>

                <span className="optional-note">
                  Optional
                </span>
              </div>

              {!photoPreview ? (
                <div className="photo-upload-box">
                  <label htmlFor="issue-photo" className="photo-upload-label">
                    <div className="photo-upload-icon">📸</div>

                    <h3>Add a photo of the issue</h3>

                    <p>
                      Upload a clear photo so authorities can understand
                      the problem faster.
                    </p>

                    <span className="photo-upload-button">
                      Choose Photo
                    </span>

                    <small>
                      JPG, JPEG, PNG or WEBP · Max 5 MB
                    </small>

                    <input
                      id="issue-photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      hidden
                    />
                  </label>
                </div>
              ) : (
                <div className="photo-preview-card">
                  <div className="photo-preview-image-wrapper">
                    <img
                      src={photoPreview}
                      alt="Preview of reported issue"
                      className="photo-preview-image"
                    />
                  </div>

                  <div className="photo-preview-info">
                    <div>
                      <strong>{photo.name}</strong>
                      <span>
                        {(photo.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>

                    <div className="photo-preview-actions">
                      <label
                        htmlFor="change-issue-photo"
                        className="photo-change-button"
                      >
                        Change Photo
                        <input
                          id="change-issue-photo"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          hidden
                        />
                      </label>

                      <button
                        type="button"
                        className="photo-remove-button"
                        onClick={handleRemovePhoto}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="photo-upload-tip">
                <span>💡</span>
                <div>
                  <strong>Tip</strong>
                  <p>
                    Take a clear photo that shows the issue and its
                    surroundings.
                  </p>
                </div>
              </div>

              {!photo && (
                <div className="photo-skip-note">
                  Photo is optional. You can continue without adding one.
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="form-section">
              <div className="section-heading">
                <div>
                  <h2>Review your report</h2>
                  <p>
                    Check the details before sending your report to
                    Nivra.
                  </p>
                </div>
              </div>

              <div className="review-card">
                <div className="review-row">
                  <span>Issue Title</span>
                  <strong>{formData.title}</strong>
                </div>

                <div className="review-row">
                  <span>Category</span>
                  <strong>
                    {selectedCategory?.icon}{" "}
                    {selectedCategory?.label || "-"}
                  </strong>
                </div>

                <div className="review-row">
                  <span>Priority</span>
                  <strong>
                    {selectedPriority?.label || formData.priority}
                  </strong>
                </div>

                <div className="review-row review-description">
                  <span>Description</span>
                  <strong>{formData.description}</strong>
                </div>

                <div className="review-row">
                  <span>Location</span>
                  <strong>
                    {location
                      ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
                      : "Not selected"}
                  </strong>
                </div>

                <div className="review-row">
                  <span>Photo</span>
                  <strong>
                    {photo ? photo.name : "Not added"}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="form-error">
              <span>!</span>
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={goBack}
            >
              {currentStep === 1 ? "Cancel" : "← Back"}
            </button>

            {currentStep === 1 && (
              <button
                type="button"
                className="submit-button"
                onClick={goToLocation}
              >
                Continue to Location
                <span>→</span>
              </button>
            )}

            {currentStep === 2 && (
              <button
                type="button"
                className="submit-button"
                onClick={goToPhoto}
              >
                Continue to Photo
                <span>→</span>
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="button"
                className="submit-button"
                onClick={goToSubmit}
              >
                Continue to Review
                <span>→</span>
              </button>
            )}

            {currentStep === 4 && (
              <button
                type="submit"
                className="submit-button"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Report"}
                <span>{submitting ? "…" : "✓"}</span>
              </button>
            )}
          </div>
        </form>

        <aside className="report-info-card">
          <div className="info-top">
            <div className="info-icon">📍</div>

            <div>
              <h3>How reporting works</h3>
              <p>
                A few simple steps are all it takes to put a civic
                issue on the map.
              </p>
            </div>
          </div>

          <div className="info-steps">
            <div
              className={`info-item ${
                currentStep >= 1 ? "active" : ""
              }`}
            >
              <div className="info-number">1</div>

              <div>
                <strong>Describe the issue</strong>
                <span>
                  Tell us what is happening.
                </span>
              </div>
            </div>

            <div
              className={`info-item ${
                currentStep >= 2 ? "active" : ""
              }`}
            >
              <div className="info-number">2</div>

              <div>
                <strong>Choose the location</strong>
                <span>
                  Pin the exact location on the map.
                </span>
              </div>
            </div>

            <div
              className={`info-item ${
                currentStep >= 3 ? "active" : ""
              }`}
            >
              <div className="info-number">3</div>

              <div>
                <strong>Add a photo</strong>
                <span>
                  Show authorities what the problem looks like.
                </span>
              </div>
            </div>

            <div
              className={`info-item ${
                currentStep >= 4 ? "active" : ""
              }`}
            >
              <div className="info-number">4</div>

              <div>
                <strong>Submit the report</strong>
                <span>
                  Nivra will send it into the civic workflow.
                </span>
              </div>
            </div>
          </div>

          <div className="report-tip">
            <span>💡</span>

            <div>
              <strong>Tip</strong>
              <p>
                Try to report the exact location and include useful
                details. It makes verification much easier.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ReportIssue;

