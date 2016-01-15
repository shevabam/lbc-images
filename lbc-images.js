/**
 * lbc-images.js
 *
 * Permet de télécharger les images d'une annonce leboncoin.fr
 *
 * Utilisation :
 *     node lbc-images.js URL-DE-L-ANNONCE-LBC
 * 
 * @website https://github.com/shevabam/lbc-images
 * @author  shevabam <http://www.shevarezo.fr>
 */

var request = require("request");
var cheerio = require("cheerio");
var fs = require("fs");
var download = require('url-download');


// Paramètres du script
var params = {
    directory: 'images'
}


// Vérification des paramètres passés
if (process.argv.length != 3) {
    console.log('Usage: node lbc-images.js URL');
    return;
}

var url = process.argv[2];


request(url, function(error, response, body) {
    if (!error && response.statusCode == 200)
    {
        var $ = cheerio.load(body);

        // Titre de l'annonce
        var title = $('.lbcContainer h1').text();

        console.log("\n");
        console.log('[Récupération des images de l\'annonce "'+title+'"]');
        console.log("\n");

        // 1ère méthode, on regarde dans .lbcImages
        if ($('.lbcImages').length > 0)
        {
            $('.lbcImages meta[itemprop="image"]').each(function(){
                var image = $(this).attr('content');

                getImage(image, params.directory);
            });
        }
        // 2ème méthode, on regarde dans #thumbs_carousel
        else if ($('#thumbs_carousel').length > 0)
        {
            $('#thumbs_carousel .thumbs').each(function(){
                var bg = $(this).css('background-image');
                var image = bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');

                getImage(image, params.directory);
            });
        }
        // 3ème méthode, nouvelle IHM
        else if ($('.carousel .thumbnails') > 0)
        {
            $('.carousel .thumbnails .thumb').each(function(){
                var image = $(this).find('img').attr('src');
                image = image.replace('/thumbs/', '/images/');

                getImage(image, params.directory);
            });
        }
        else
        {
            console.log('Impossible de récupérer les images de l\'annonce');
        }

        console.log("\n");
    }
    else
    {
        console.log('Erreur de chargement de la page');
        console.log(error);
    }
});


// Télécharge une image et la met dans un répertoire
function getImage(url, dir)
{
    if (!fs.existsSync(dir))
    {
        fs.mkdirSync(dir);
    }

    console.log('Téléchargement de : '+url);
    download(url, dir);
}