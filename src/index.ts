import "./config/configure-dotenv";
import { PORT } from "./config/constants";
import { app } from "./server/index";

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
