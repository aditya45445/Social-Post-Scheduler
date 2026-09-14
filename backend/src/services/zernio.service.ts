import Zernio from '@zernio/node';
import { config } from '../config/config.ts'

const zernio = new Zernio({
    apiKey: config.zernioApi || "",
    baseURL: "https://zernio.com/api"
});

export default zernio

