const headings = document.querySelectorAll('div.indexPageTitle');

headings.forEach((headingDiv) => {
    let heading = headingDiv.querySelector('h3').innerText;
    let list = headingDiv.nextElementSibling;

    const tricks = list.querySelectorAll('a');
    const trickList = [];

    tricks.forEach(trick => {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);

        trickList.push({ color: randomColor, label: trick.innerText });
    });

    console.log(heading, JSON.stringify(trickList, null, 2));
});
