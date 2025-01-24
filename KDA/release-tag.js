
async function computeHash(content) {
    // Compute SHA-1 hash of content
    const encoder = new TextEncoder();
    const contentData = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest("SHA-1", contentData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex

}
async function computeReleaseTag() {
    // Get the DOM content
    let domContent = document.documentElement.outerHTML;
    const domHash = await computeHash(domContent);
    console.log(`SHA-1 of DOM content: ${domHash}`);

    // Collect all <script> content synchronously
    const scripts = document.querySelectorAll('script');
    let scriptContent = '';

    for (const script of scripts) {
        if (script.src) {
            try {
                // Fetch external script content synchronously
                const response = await fetch(script.src);
                if (response.ok) {
                    const scriptText = await response.text();
                    scriptContent += scriptText;
                    const scriptHash = await computeHash(scriptText);
                    console.log(`SHA-1 of script (${script.src}): ${scriptHash}`);
                }
            } catch (err) {
                console.error(`Failed to fetch script: ${script.src}`, err);
            }
        } else {
            // Add inline script content directly
            scriptContent += script.innerHTML;
        }
    }

    // Combine the DOM and script content
    const fullContent = domContent + scriptContent;

    // Encode the content to a Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(fullContent);
    // Compute the SHA-1 hash
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    // Convert the hash buffer to an integer
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    let hashInt = hashArray.reduce((acc, byte) => (acc << 8) | byte, 0);
    hashInt = Math.abs(hashInt); // Ensure positive integer

    // Compute the release tag using modulo 397
    const releasetag = hashInt % 397;

    // Update the document title
    document.title = document.title.replace(/ v.*/, ` v${(releasetag / 100).toFixed(2)}`);
    console.log(`Release tag: ${(releasetag / 100).toFixed(2)}`);
}

// Call the function to compute and apply the release tag
document.addEventListener('DOMContentLoaded', function() {
    computeReleaseTag();
});

