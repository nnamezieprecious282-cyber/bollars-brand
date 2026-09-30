
/*==========================================
        BOLLARS CURRENCY SYSTEM
==========================================*/

const USD_TO_NGN = 1500;


/*==========================================
        CONVERT USD → NGN
==========================================*/

function convertToNaira(usdPrice) {

    return usdPrice * USD_TO_NGN;

}


/*==========================================
        FORMAT NAIRA PRICE
==========================================*/

function formatNaira(nairaPrice) {

    return `₦${Number(nairaPrice).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

}


/*==========================================
        FORMAT PRODUCT PRICE
        PRODUCT PRICES ARE CURRENTLY USD
==========================================*/

function formatPrice(usdPrice) {

    const nairaPrice =
        convertToNaira(usdPrice);

    return formatNaira(nairaPrice);

}



















