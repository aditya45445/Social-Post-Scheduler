import app from './src/app.ts'
import { connectDb } from "./src/config/db.ts";

connectDb()


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})



