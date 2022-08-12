import "regenerator-runtime/runtime";
import EasySeeSo from "seeso/easy-seeso";
import * as dotenv from "dotenv";
dotenv.config();

[...document.querySelectorAll(".layout-link")].forEach((link) => {
  link.addEventListener("click", () => {
    //calibration setup
    const userId = "k1910052";
    const redirectUrl = `http://localhost:7777/layouts/layout${link.dataset.page}/index.html`;
    const calibrationPoint = 5;
    EasySeeSo.openCalibrationPage(
      process.env.LICENSE_KEY,
      userId,
      redirectUrl,
      calibrationPoint
    );
  });
});
