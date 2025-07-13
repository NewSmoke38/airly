import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const testBackend = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, { message: "Heyy, your backend is live! 🚀" }, "Backend is running successfully"));
});

export { testBackend }; 