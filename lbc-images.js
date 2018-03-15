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
var slugify = require('slugify');


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
        var title = 'lbc';

        if ($('.lbcContainer h1').length > 0)
            title = $('.lbcContainer h1').text();
        else if ($('#main header h1').length > 0)
            title = $('#main header h1').text();
        else if ($('div[data-qa-id="adview_spotlight_description_container"]').length > 0)
            title = $('div[data-qa-id="adview_spotlight_description_container"] h1').text();

        title = title.trim();

        console.log("\n");
        console.log('[Récupération des images de l\'annonce "'+title+'"]');
        console.log("\n");

        // 1ère méthode, on regarde dans .lbcImages
        if ($('.lbcImages').length > 0)
        {
            $('.lbcImages meta[itemprop="image"]').each(function(){
                var image = $(this).attr('content');
                    
                image = image.replace('/thumbs/', '/images/');

                if (image.indexOf("//") == 0)
                    image = "http:"+image;

                extension = image.split('.').pop();
                filename = slugify(title)+'_'+(i+1)+'.'+extension;

                getImage(image, params.directory, filename);
            });
        }
        // 2ème méthode, on regarde dans #thumbs_carousel
        else if ($('#thumbs_carousel').length > 0)
        {
            $('#thumbs_carousel .thumbs').each(function(){
                var bg = $(this).css('background-image');
                var image = bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');

                if (image.indexOf("//") == 0)
                    image = "http:"+image;

                extension = image.split('.').pop();
                filename = slugify(title)+'_'+(i+1)+'.'+extension;

                getImage(image, params.directory, filename);
            });
        }
        // 3ème méthode, nouvelle IHM
        else if ($('.carousel .thumbnails').length > 0)
        {
            if ($('.adview_main script').length > 0)
            {
                var images_script = $('.adview_main script');

                if (images_script != '')
                {
                    for (var i = 0; i < images_script.length; i++)
                    {
                        var datas = images_script[i]['firstChild']['data'];

                        var lines = datas.split("\n").slice(2).slice(0, -10).join("\n");

                        datas = lines;
                        
                        var images = Array();
                        eval(datas);
                        
                        for (var j = 0; j < images.length; j++)
                        {
                            var image = images[j];
                            image = image.replace('/thumbs/', '/images/');
                            image = image.replace('/xxl/', '/images/');

                            if (image.indexOf("//") == 0)
                                image = "http:"+image;

                            extension = image.split('.').pop();
                            filename = slugify(title)+'_'+(j+1)+'.'+extension;

                            getImage(image, params.directory, filename);
                        }
                    }
                }
            }
        }
        // 4ème méthode (IHM 02/2018)
        else if ($('div[data-qa-id="slideshow_thumbnails_container"]').length > 0)
        {
            var images_script = $('script').eq(7).text();
            
            var json = images_script.match(/window.FLUX_STATE = (.*)/);
            var datas = JSON.parse(json[1]);

            var images = datas.adview.images.urls_large;

            for (var i = 0; i < images.length; i++)
            {
                var image = images[i];

                extension = image.split('.').pop();
                filename = slugify(title)+'_'+(i+1)+'.'+extension;

                getImage(image, params.directory, filename);
            }
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
function getImage(url, dir, filename)
{
    if (!fs.existsSync(dir))
    {
        fs.mkdirSync(dir);
    }

    download(url, dir, {outputName: filename}).on('done', function(){
        console.log('Téléchargement de : '+filename);
    });
}