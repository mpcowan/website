const fs = require("fs");
const { marked } = require("marked");
const path = require("path");

// render resume
const data = fs.readFileSync(path.join(__dirname, "src/resume.md"), "utf8");

marked(data, (error, content) => {
  if (error) {
    console.error(error.message);
    throw error;
  }

  const html = fs.readFileSync(
    path.join(__dirname, "src/resume-wrapper.html"),
    "utf8"
  );

  fs.writeFileSync(
    path.join(__dirname, "src/resume.html"),
    html.replace("{{RESUME_CONTENT}}", content)
  );
});
