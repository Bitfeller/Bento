<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script>
        window.MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [[], []]
            },
            svg: {
                fontCache: 'global',
                scale: 10,
            },
            startup: {},
        };
    </script>
    <style>
        .container {
            width: 500px;
            height: 500px;
        }
    </style>
    <script type="text/javascript" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
</head>
<body>
    <div class="container">
        Look at my cool math!
        <p id="math">$$H_2O$$</p>
    </div>
    <script defer>
        const math = document.getElementById('math');
        MathJax.startup.pageReady = () => {
            let promise = Promise.resolve();  // Used to hold chain of typesetting calls

            function typeset(code) {
                MathJax.startup.promise = MathJax.startup.promise
                    .then(() => MathJax.typesetPromise(code()))
                    .catch((err) => console.log('Typeset failed: ' + err.message));
                return MathJax.startup.promise;
            }

            (async() => {
                await typeset(() => {
                    return [math];
                });
            })();
        };
    </script>
</body>
</html>