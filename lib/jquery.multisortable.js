/*
 * jquery.multisortable.js - v0.1.3
 * https://github.com/iamvery/jquery.multisortable
 *
 * Author: Ethan Atlakson, Jay Hayes
 * Last Revision 3/16/2012
 * multi-selectable, multi-sortable jQuery plugin
*/

!function($){
	
	$.fn.multiselectable = function(options) {
		if (!options) { options = {} }
		options = $.extend({}, $.fn.multiselectable.defaults, options)

        function handleSelection(e) {
            var item = $(this),
                parent = item.parent(),
                myIndex = item.index(),
                prev = parent.find('.multiselectable-previous'),
                prevIndex = prev.index()

            if (e.ctrlKey || e.metaKey) {
                if (item.not('.child').length) {
                    if (item.hasClass(options.selectedClass))
                        item.nextUntil(':not(.child)').removeClass(options.selectedClass)
                    else
                        item.nextUntil(':not(.child)').addClass(options.selectedClass)
                }
            } else {
                parent.find('.' + options.selectedClass).removeClass(options.selectedClass)
            }

            if (e.shiftKey) {
                if (prevIndex < myIndex)
                    item.prevUntil('.multiselectable-previous').add(prev).toggleClass(options.selectedClass)
                else if (prevIndex > myIndex)
                    item.nextUntil('.multiselectable-previous').add(prev).toggleClass(options.selectedClass)
            } else {
                parent.find('.multiselectable-previous').removeClass('multiselectable-previous')
                item.addClass('multiselectable-previous')
            }

            item.toggleClass(options.selectedClass)
            options.click(e, item)
        }
		
		return this.each(function() {
			var list = $(this)
			
			if (!list.data('multiselectable')) {
				list.data('multiselectable', true)
				.delegate(options.items, 'mousedown', function(e) {
                    if (!(e.ctrlKey || e.metaKey || e.shiftKey || $(this).hasClass(options.selectedClass)))
                        handleSelection.call(this, e)
                })
				.delegate(options.items, 'click', handleSelection)
				.disableSelection()
			}
		})
	}
	
	$.fn.multiselectable.defaults = {
		click: function(event, elem){},
		selectedClass: 'selected',
        items: 'li'
	}
	
	//---
	
	$.fn.multisortable = function(options) {
		if (!options) { options = {} }
		settings = $.extend({}, $.fn.multisortable.defaults, options)
		
		function regroup(item, list) {
			if (list.find('.' + settings.selectedClass).length > 0) {
				var myIndex = item.data('i')
				
				var itemsBefore = list.find('.' + settings.selectedClass).filter(function() {
					return $(this).data('i') < myIndex
				}).css({
					position: '',
					width: ''
				})
				
				item.before(itemsBefore)
				
				var itemsAfter = list.find('.' + settings.selectedClass).filter(function() {
					return $(this).data('i') > myIndex
				}).css({
					position: '',
					width: ''
				})
				
				item.after(itemsAfter)
				
				setTimeout(function(){
					itemsAfter.add(itemsBefore).addClass(settings.selectedClass)
				}, 0)
			}
		}
		
		return this.each(function() {
			var list = $(this)
			
			//enable multi-selection
			list.multiselectable({
                selectedClass: settings.selectedClass,
                click: settings.click,
                items: settings.items
            })
			
			//enable sorting
			options.cancel = settings.items+':not(.'+settings.selectedClass+')'
			options.placeholder = settings.placeholder
			options.start = function(event, ui) {
				if (ui.item.hasClass(settings.selectedClass)) {
					var parent = ui.item.parent()
					
					//assign indexes to all selected items
					parent.find('.' + settings.selectedClass).each(function(i) {
						$(this).data('i', i)
					})
					
					// adjust placeholder size to be size of items
					var height = parent.find('.' + settings.selectedClass).length * ui.item.outerHeight()
					ui.placeholder.height(height)
				}
				
				settings.start(event, ui)
			}
			
			options.stop = function(event, ui) {
				regroup(ui.item, ui.item.parent())
				settings.stop(event, ui)
			}
			
			options.sort = function(event, ui) {
				var parent = ui.item.parent(),
					myIndex = ui.item.data('i'),
					top = parseInt(ui.item.css('top').replace('px', '')),
					left = parseInt(ui.item.css('left').replace('px', ''))
				
				$.fn.reverse = Array.prototype.reverse
				var height = 0
				$('.' + settings.selectedClass, parent).filter(function() {
					return $(this).data('i') < myIndex
				}).reverse().each(function() {
					height += $(this).outerHeight()
					$(this).css({
						left: left,
						top: top - height,
						position: 'absolute',
						zIndex: 1000,
						width: ui.item.width()
					})
				})
				
				var height = ui.item.outerHeight()
				$('.' + settings.selectedClass, parent).filter(function() {
					return $(this).data('i') > myIndex
				}).each(function() {
					var item = $(this)
					item.css({
						left: left,
						top: top + height,
						position: 'absolute',
						zIndex: 1000,
						width: ui.item.width()
					})
					
					height += item.outerHeight()
				})
				
				settings.sort(event, ui)
			}
			
			options.receive = function(event, ui) {
				regroup(ui.item, ui.sender)
				settings.receive(event, ui)
			}
			
			list.sortable(options).disableSelection()
		})
	}
	
	$.fn.multisortable.defaults = {
		start: function(event, ui) { },
		stop: function(event, ui) { },
		sort: function(event, ui) { },
		receive: function(event, ui) { },
		click: function(event, elem) { },
		selectedClass: 'selected',
		placeholder: 'placeholder',
		items: 'li'
	}
	
}(jQuery);
