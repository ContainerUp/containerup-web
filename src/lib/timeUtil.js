import {parse} from "date-fns";

const dateAgo = d => {
    const now = Math.floor(Date.now() / 1000);
    const p = Math.floor(d.getTime() / 1000);
    const delta = now - p;
    if (delta < 0) {
        return d.toLocaleString();
    }

    if (delta < 1) {
        return 'Less than a second';
    }
    if (delta < 2) {
        return '1 second ago';
    }
    if (delta < 60) {
        return delta + ' seconds ago';
    }

    if (delta < 120) {
        return 'About a minute ago';
    }
    if (delta < 3600) {
        return Math.floor(delta / 60) +  ' minutes ago';
    }

    if (delta < 7200) {
        return 'About an hour ago';
    }
    if (delta < 3600 * 24 * 2) {
        return Math.floor(delta / 3600) +  ' hours ago';
    }

    if (delta < 3600 * 24 * 14) {
        return Math.floor(delta / 3600 / 24) + ' days ago';
    }

    if (delta < 3600 * 24 * 60) {
        return Math.floor(delta / 3600 / 24 / 7) + ' weeks ago';
    }

    if (delta < 3600 * 24 * 365 * 2) {
        return Math.floor(delta / 2600 / 24 / 30) + ' months ago';
    }

    return Math.floor(delta / 3600 / 24 / 365) +  ' years ago';
}

const parseRFC3339Nano = str => {
    return parse(str, `yyyy-MM-dd'T'HH:mm:ss.SSSSSSSSSXXX`, new Date());
}

const timeUtil = {
    dateAgo,
    parseRFC3339Nano
}

export default timeUtil;
