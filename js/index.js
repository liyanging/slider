(function() {
   /*
    * mode v: 垂直方向，h：水平方向 默认值为 h 水平方向
    * activeIndex 初始化index 默认值0
    * sliderItemClass  滑动模块的class 默认为slider-item
    * isFullSlider 是否是全屏滑动，默认是全屏
    * window 设置滑动内容的长宽，如果是全屏的，此项可以不传
    * pagination 分页class 默认值为空
    * paginationElement 分页元素的标签
    * slideNextClass 下一张按钮的class 可选
    * slidePrevClass 上一张按钮的class 可选
    * wrapperClass 控制框的class
    * bulletClass 控制按钮的默认class
    * bulletActiveClass 控制按钮的当前状态
    * */
   var FullSlider = function(container,opt) {
      var Default = {
         mode: 'h',
         activeIndex: 0,
         sliderItemClass: '.slider-item',
         isFullSlider: true,
         window: {
            width: $(window).width(),
            height: $(window).height()
         },
         // Pagination
         pagination: '.full-slider-pagination',
         paginationElement: 'span',
         slideNextClass: 'swiper-slide-next',
         slidePrevClass: 'swiper-slide-prev',
         wrapperClass: 'swiper-wrapper',
         bulletClass: 'swiper-pagination-bullet',
         bulletActiveClass: 'swiper-pagination-bullet-active'
      };
      //FullSlider
      var fs = this;
      fs.$container = $(container);

      if(fs.$container.length < 0) return;
      if(fs.$container.length > 1) {
         fs.$container.each(function() {
            new FullSlider(this, opt);
         });

      }
      fs.config = $.extend(Default,opt);
      fs.window = fs.config.window;
      fs.isMove = false;
      fs.fullSwiper = fs.$container[0];
      fs.$sliderItem = fs.$container.find(fs.config.sliderItemClass);
      fs.isSupportTouch = /(iPhone|iPod|iPad|Android)/ig.test(navigator.userAgent);
      fs.touchEvents = {
         start : fs.isSupportTouch ? 'touchstart' : 'mousedown',
         move : fs.isSupportTouch ? 'touchmove' : 'mousemove',
         end : fs.isSupportTouch ? 'touchend' : 'mouseup'
      };
      fs.sliderItemLen = fs.$sliderItem.length;
      // Pagination
      if (fs.config.pagination) {
         fs.paginationContainer = $(fs.config.pagination);
      }
      if(fs.config.mode == 'h') {
         fs.config.moveAttr = 'left';
         fs.config.moveDis = fs.window.width;
      }else {
         fs.config.moveAttr = 'top';
         fs.config.moveDis = fs.window.height;
      }
      fs.init = function() {

         fs.$sliderItem.eq(fs.config.activeIndex).addClass('slider-active');
         if(fs.config.pagination) {
            fs.initPagination();
         }
         fs.initCss();
         fs.bindEvent();
      };
      fs.initPagination = function() {
         var html = '';
         for(var i = 0;i < fs.sliderItemLen;i++ ) {
            var cl = i == fs.config.activeIndex ? ' ' + fs.config.bulletActiveClass : '';
            html += '<span class="'+ fs.config.bulletClass + cl +'"></span>'
         }
         fs.paginationContainer.html(html);
      };

      fs.initCss = function() {
         fs.window = {
            width: fs.config.isFullSlider ? $(window).width() : fs.window.width,
            height: fs.config.isFullSlider ? $(window).height() : fs.window.height
         };
         fs.$container.css({width: fs.window.width, height: fs.window.height});
         var $initItem = fs.$container.find('.slider-active');
         $initItem.css(fs.config.moveAttr,'0');
         $initItem.prevAll().css(fs.config.moveAttr, -fs.config.moveDis);
         $initItem.nextAll().css(fs.config.moveAttr , fs.config.moveDis);
      };
      fs.bindEvent = function() {
         //滚动事件
         $(document).on('DOMMouseScroll mousewheel keydown', fs.mousewheelScroll);
         $(window).resize(function() {
            fs.initCss();
         });
         fs.on(fs.$container,fs.touchEvents.start,fs.moveStart);
         fs.on(fs.$container,fs.touchEvents.move,fs.moveing);
         fs.on(fs.$container,fs.touchEvents.end,fs.moveEnd);

         //左右或上下 切换
         fs.$container.on('click','.'+fs.config.slideNextClass,function() {
            fs.move(-1);
            fs.moveEnd();
         });
         fs.$container.on('click','.'+fs.config.slidePrevClass,function() {
            fs.move(1);
            fs.moveEnd();
         });
         if(fs.config.pagination) {
            fs.paginationContainer.on('click','span',function() {
               var $target = $(this),
                   targetIndex = $target.index(),
                   $current = fs.paginationContainer.find('.' + fs.config.bulletActiveClass),
                   curIndex = $current.index();
               if(curIndex - targetIndex < 0) {
                  fs.move(-1,targetIndex);
               }
               if(curIndex - targetIndex > 0) {
                  fs.move(1,targetIndex);
               }
            });
         }
      };
      fs.mousewheelScroll = function(e) {
         var dir = 1;
         //up
         if (e.originalEvent.detail < 0 || e.originalEvent.wheelDelta > 0 || e.keyCode === 38) {
            dir = 1;
         }else if (e.originalEvent.detail > 0 || e.originalEvent.wheelDelta < 0 || e.keyCode === 40) {
            dir = -1;
         }
         fs.move(dir);
         e.preventDefault();
      };
      fs.moveStart = function(event) {
         fs.isMove = true;
         var mousePos = fs.getMousePos(event);
         fs.startX = mousePos.x;
         fs.startY = mousePos.y;
      };
      fs.moveing = function(event) {
         if(fs.isMove) {
            var mousePos = fs.getMousePos(event);
            fs.currentX = mousePos.x;
            fs.currentY = mousePos.y;
            var offY = fs.currentY - fs.startY;
            if(fs.config.mode == 'h') {
               offY = fs.currentX - fs.startX;
            }
            if(offY < -30) {
               fs.move(-1);
               fs.moveEnd();
            }else if(offY > 30 ){
               fs.move(1);
               fs.moveEnd();
            }
         }
         return false;
      };
      fs.moveEnd = function() {
         fs.isMove = false;
      };
      fs.move = function(dir,nextIndex) {
         var $current = fs.$container.find(".slider-active");
         var index = $current.index();
         //dir:1 up,-1 down
         if(fs.$sliderItem.is(':animated')) return;
         if(index == 0 && dir == 1) return;
         if(index == fs.sliderItemLen -1  && dir == -1) return;
         nextIndex = nextIndex || index - dir;
         var $next = fs.$sliderItem.eq(nextIndex);
         if(fs.config.mode == 'h') {
            $current.removeClass('slider-active').stop().animate({left: dir*fs.window.width});
            $next.addClass('slider-active').stop().animate({left: 0},function() {
               $next.prevAll().css({left: -fs.window.width});
               $next.nextAll().css({left: fs.window.width});
            });

         }else {
            $current.removeClass('slider-active').stop().animate({top: dir*fs.window.height});
            $next.addClass('slider-active').stop().animate({top: 0},function() {
               $next.prevAll().css({top: -fs.window.height});
               $next.nextAll().css({top: fs.window.height});
            });
         }
         if(fs.config.pagination) {
            var paginationBullet = fs.paginationContainer.find('span');
            paginationBullet.eq(index).removeClass(fs.config.bulletActiveClass);
            paginationBullet.eq(nextIndex).addClass(fs.config.bulletActiveClass);
         }

      };
      fs.getMousePos = function(event) {
         var mousePos = {x: 0,y: 0};
         var event = window.event || event;
         if(typeof event.originalEvent == 'undefined') {
            mousePos.x = fs.isSupportTouch ? event.touches[0].clientX : event.clientX;
            mousePos.y = fs.isSupportTouch ? event.touches[0].clientY : event.clientY;
         }else {
            mousePos.x = fs.isSupportTouch ? event.originalEvent.touches[0].clientX : event.clientX;
            mousePos.y = fs.isSupportTouch ? event.originalEvent.touches[0].clientY : event.clientY;
         }
         return mousePos;
      };
      fs.on = function(obj,type,fn) {
         if(obj instanceof jQuery) {
            fs.$container.on(type,fn);
         }else {
            obj.attachEvent ? obj.attachEvent("on" + type,fn) : obj.addEventListener(e,fn,false);
         }
      };
      fs.init();
   };
   window.FullSlider = FullSlider;
})();


