export default function isInsideBrackets(lineText:string) {
    const removeWhitespace = lineText.trim();
    return lineText.match(/{$/g) ? true : false
}