// import axios from 'axios';
//
// module.exports = async function dynamicRoutes() {
//
//     let endpoint = process.env.WP_BACKEND_ENDPOINT || 'https://admin.test.com/wp-json'
//     endpoint += "/wp/v2/routes"
//
//     // Get routes from custom endpoint
//     return await axios.get(endpoint).then((res) => {
//         return res.data.map(item => {
//             return item;
//         });
//     });
// }
