!function(t){function r(e){if(o[e])return o[e].exports;var i=o[e]={exports:{},id:e,loaded:!1};return t[e].call(i.exports,i,i.exports,r),i.loaded=!0,i.exports}var o={};return r.m=t,r.c=o,r.p="",r(0)}({0:function(t,r,o){o(10)},10:function(t,r){$(function(){$('[data-toggle="tooltip"]').tooltip(),$('[data-toggle="popover"]').popover(),$('[data-toggle="popover-dismissable"]').popover(),$('input[type="tags"]').tagsInput({delimiter:[",",";"," "]}),$("[data-datepicker]").datepicker({todayHighlight:!0,autoclose:!0,templates:{leftArrow:'<i class="lnr-chevron-left"></i>',rightArrow:'<i class="lnr-chevron-right"></i>'}}),$("[data-wysiwyg]").trumbowyg({autogrow:!0,removeformatPasted:!0,btns:[["viewHTML"],["formatting"],"btnGrp-semantic",["superscript","subscript"],"btnGrp-justify","btnGrp-lists",["horizontalRule"],["removeformat"],["plugin"],["fullscreen"]]})})}});