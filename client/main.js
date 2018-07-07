import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { URLs, URLsGrouped } from '../collections/URLsCollection';
import './main.html';

// rota do client side (página principal).
Router.route('/', function() {
    this.render('home')
})

/*
 * Template "listagem"
 */

Template.listagem.onCreated(function() {
    this.autorun(() => {
        // inscreverse para as informações publicadas.
        this.subscribe('ultimas_urls');
        this.subscribe('urls_mais_encurtadas');
    })
});

// funções para integração com UI.
Template.listagem.helpers({
    ultimas_urls: URLs.find({}, { sort: { createdAt: -1 } }),
    urls_mais_encurtadas: URLsGrouped.find({}, { sort: { total: -1 }, limit: 3 }),
})

/*
 * Template "urlsShortener"
 */

// funções para integração com UI.
Template.urlsShortener.helpers({
    shortUrl() {
        var url = Session.get('_id');
        if (typeof(url) === 'undefined' || url === '' || url === 0) return ''
        return `${window.location.href}${url}`
    }
})

Template.urlsShortener.events({
    'click #encurtar' (event, instance) {
        var url = document.getElementById('url')
        if (url.value === '') {
            return
        }

        // chamar função inserirURL no server side.
        Meteor.call('inserirURL', url.value, (error, result) => {
            Session.set('_id', result)
        });
    },
    'click #copiar' () {
        var url = Session.get('_id')
        if (typeof(url) === 'undefined' || url === '') {
            return
        }

        const el = document.createElement('textarea');
        el.value = `${window.location.href}${url}`;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }
});