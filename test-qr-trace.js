const { Zalo } = require('zca-js');

async function test() {
    console.log('Testing Zalo QR generation...');
    const zalo = new Zalo({});
    
    // intercept fetch to see what Zalo responds with
    const origFetch = global.fetch;
    global.fetch = async (url, options) => {
        console.log(`[FETCH] ${url}`);
        const res = await origFetch(url, options);
        const text = await res.clone().text();
        console.log(`[FETCH RES]`, text);
        return res;
    };

    try {
        await zalo.loginQR({}, (res) => {
            console.log('Event:', res);
        });
    } catch(e) {
        console.error('Error:', e);
    }
}

test();
