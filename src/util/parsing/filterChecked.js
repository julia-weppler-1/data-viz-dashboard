export default function filterForChecked(arrayOfObjects) { 
    return arrayOfObjects.filter(element => {
        return (element.checked);
    })

}