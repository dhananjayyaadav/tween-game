"use strict";
var wpforms =
  window.wpforms ||
  (function (n, s, p) {
    var l = {
      init: function () {
        p(l.ready),
          p(s).on("load", function () {
            "function" == typeof p.ready.then ? p.ready.then(l.load) : l.load();
          }),
          l.bindUIActions(),
          l.bindOptinMonster();
      },
      ready: function () {
        l.clearUrlQuery(),
          l.setUserIndentifier(),
          l.loadValidation(),
          l.loadDatePicker(),
          l.loadTimePicker(),
          l.loadInputMask(),
          l.loadSmartPhoneField(),
          l.loadPayments(),
          l.loadMailcheck(),
          l.loadChoicesJS(),
          p(".wpforms-randomize").each(function () {
            for (var e = p(this), t = e.children(); t.length; )
              e.append(t.splice(Math.floor(Math.random() * t.length), 1)[0]);
          }),
          p(".wpforms-page-button").prop("disabled", !1),
          p(n).trigger("wpformsReady");
      },
      load: function () {},
      clearUrlQuery: function () {
        var e = s.location,
          t = e.search;
        -1 !== t.indexOf("wpforms_form_id=") &&
          ((t = t.replace(
            /([&?]wpforms_form_id=[0-9]*$|wpforms_form_id=[0-9]*&|[?&]wpforms_form_id=[0-9]*(?=#))/,
            ""
          )),
          history.replaceState({}, null, e.origin + e.pathname + t));
      },
      loadValidation: function () {
        void 0 !== p.fn.validate &&
          (p(".wpforms-input-temp-name").each(function (e, t) {
            var r = Math.floor(9999 * Math.random()) + 1;
            p(this).attr("name", "wpf-temp-" + r);
          }),
          p(n).on("change", ".wpforms-validate input[type=url]", function () {
            var e = p(this).val();
            if (!e) return !1;
            "http://" !== e.substr(0, 7) &&
              "https://" !== e.substr(0, 8) &&
              p(this).val("https://" + e);
          }),
          (p.validator.messages.required = wpforms_settings.val_required),
          (p.validator.messages.url = wpforms_settings.val_url),
          (p.validator.messages.email = wpforms_settings.val_email),
          (p.validator.messages.number = wpforms_settings.val_number),
          void 0 !== p.fn.payment &&
            p.validator.addMethod(
              "creditcard",
              function (e, t) {
                e = p.payment.validateCardNumber(e);
                return this.optional(t) || e;
              },
              wpforms_settings.val_creditcard
            ),
          p.validator.addMethod(
            "extension",
            function (e, t, r) {
              return (
                (r =
                  "string" == typeof r
                    ? r.replace(/,/g, "|")
                    : "png|jpe?g|gif"),
                this.optional(t) || e.match(new RegExp("\\.(" + r + ")$", "i"))
              );
            },
            wpforms_settings.val_fileextension
          ),
          p.validator.addMethod(
            "maxsize",
            function (e, t, r) {
              var a,
                o,
                i = r,
                r = this.optional(t);
              if (r) return r;
              if (t.files && t.files.length)
                for (a = 0, o = t.files.length; a < o; a++)
                  if (t.files[a].size > i) return !1;
              return !0;
            },
            wpforms_settings.val_filesize
          ),
          p.validator.addMethod("step", function (e, t, r) {
            i = r;
            const a =
              (Math.floor(i) !== i && i.toString().split(".")[1].length) || 0;
            function o(e) {
              return Math.round(e * Math.pow(10, a));
            }
            var i = o(p(t).attr("min"));
            return (e = o(e) - i), this.optional(t) || o(e) % o(r) == 0;
          }),
          (p.validator.methods.email = function (e, t) {
            var r = (function (e) {
                if (254 < e.length) return !1;
                e = e.split("@");
                if (2 !== e.length) return !1;
                var t = e[0],
                  e = e[1];
                if (63 < t.length) return !1;
                for (const r of e.split(".")) if (63 < r.length) return !1;
                return !0;
              })(e),
              a = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),
              e = /^(?!\.)(?!.*?\.\.).*[^.]$/.test(e);
            return this.optional(t) || (a && e && r);
          }),
          p.validator.addMethod(
            "restricted-email",
            function (e, r) {
              var a = this,
                t = p(r),
                o = t.closest(".wpforms-field"),
                i = t.closest(".wpforms-form"),
                n = "pending";
              return (
                !t.val().length ||
                (this.startRequest(r),
                p.post({
                  url: wpforms_settings.ajaxurl,
                  type: "post",
                  async: !1,
                  data: {
                    action: "wpforms_restricted_email",
                    form_id: i.data("formid"),
                    field_id: o.data("field-id"),
                    email: t.val(),
                  },
                  dataType: "json",
                  success: function (e) {
                    var t = {};
                    (n = e.success && e.data)
                      ? ((a.toHide = a.errorsFor(r)), a.showErrors())
                      : ((t[r.name] = wpforms_settings.val_email_restricted),
                        a.showErrors(t)),
                      a.stopRequest(r, n);
                  },
                }),
                n)
              );
            },
            wpforms_settings.val_email_restricted
          ),
          p.validator.addMethod(
            "confirm",
            function (e, t, r) {
              t = p(t).closest(".wpforms-field");
              return (
                p(t.find("input")[0]).val() === p(t.find("input")[1]).val()
              );
            },
            wpforms_settings.val_confirm
          ),
          p.validator.addMethod(
            "required-payment",
            function (e, t) {
              return 0 < l.amountSanitize(e);
            },
            wpforms_settings.val_requiredpayment
          ),
          p.validator.addMethod(
            "time12h",
            function (e, t) {
              return (
                this.optional(t) ||
                /^((0?[1-9]|1[012])(:[0-5]\d){1,2}(\ ?[AP]M))$/i.test(e)
              );
            },
            wpforms_settings.val_time12h
          ),
          p.validator.addMethod(
            "time24h",
            function (e, t) {
              return (
                this.optional(t) ||
                /^(([0-1]?[0-9])|([2][0-3])):([0-5]?[0-9])(\ ?[AP]M)?$/i.test(e)
              );
            },
            wpforms_settings.val_time24h
          ),
          p.validator.addMethod(
            "turnstile",
            function (e) {
              return e;
            },
            wpforms_settings.val_turnstile_fail_msg
          ),
          p.validator.addMethod(
            "time-limit",
            function (e, t) {
              var t = p(t),
                r = t.data("min-time"),
                a = t.data("max-time"),
                t = t.prop("required");
              return (
                void 0 === r ||
                !(t || !l.empty(e)) ||
                (l.compareTimesGreaterThan(a, r)
                  ? l.compareTimesGreaterThan(e, r) &&
                    l.compareTimesGreaterThan(a, e)
                  : (l.compareTimesGreaterThan(e, r) &&
                      l.compareTimesGreaterThan(e, a)) ||
                    (l.compareTimesGreaterThan(r, e) &&
                      l.compareTimesGreaterThan(a, e)))
              );
            },
            function (e, t) {
              var t = p(t),
                r = t.data("min-time"),
                t = t.data("max-time"),
                r = r.replace(/^00:([0-9]{2})pm$/, "12:$1pm"),
                t = t.replace(/^00:([0-9]{2})pm$/, "12:$1pm");
              return (
                (r = r.replace(/(am|pm)/g, " $1").toUpperCase()),
                (t = t.replace(/(am|pm)/g, " $1").toUpperCase()),
                wpforms_settings.val_time_limit
                  .replace("{minTime}", r)
                  .replace("{maxTime}", t)
              );
            }
          ),
          p.validator.addMethod(
            "check-limit",
            function (e, t) {
              var t = p(t).closest("ul"),
                r = t.find('input[type="checkbox"]:checked'),
                t = parseInt(t.attr("data-choice-limit") || 0, 10);
              return 0 === t || r.length <= t;
            },
            function (e, t) {
              t = parseInt(
                p(t).closest("ul").attr("data-choice-limit") || 0,
                10
              );
              return wpforms_settings.val_checklimit.replace("{#}", t);
            }
          ),
          void 0 !== p.fn.intlTelInput &&
            p.validator.addMethod(
              "smart-phone-field",
              function (e, t) {
                return (
                  !e.match(/[^\d()\-+\s]/) &&
                  (this.optional(t) || p(t).intlTelInput("isValidNumber"))
                );
              },
              wpforms_settings.val_phone
            ),
          p.validator.addMethod(
            "inputmask-incomplete",
            function (e, t) {
              return (
                0 === e.length ||
                void 0 === p.fn.inputmask ||
                p(t).inputmask("isComplete")
              );
            },
            wpforms_settings.val_inputmask_incomplete
          ),
          p.validator.addMethod(
            "required-positive-number",
            function (e, t) {
              return 0 < l.amountSanitize(e);
            },
            wpforms_settings.val_number_positive
          ),
          p.validator.addMethod(
            "us-phone-field",
            function (e, t) {
              return (
                !e.match(/[^\d()\-+\s]/) &&
                (this.optional(t) || 10 === e.replace(/[^\d]/g, "").length)
              );
            },
            wpforms_settings.val_phone
          ),
          p.validator.addMethod(
            "int-phone-field",
            function (e, t) {
              return (
                !e.match(/[^\d()\-+\s]/) &&
                (this.optional(t) || 0 < e.replace(/[^\d]/g, "").length)
              );
            },
            wpforms_settings.val_phone
          ),
          p.validator.addMethod(
            "password-strength",
            function (e, t) {
              var r = p(t);
              return (
                ("" === r.val().trim() &&
                  !r.hasClass("wpforms-field-required")) ||
                WPFormsPasswordField.passwordStrength(e, t) >=
                  Number(r.data("password-strength-level"))
              );
            },
            wpforms_settings.val_password_strength
          ),
          p(".wpforms-validate").each(function () {
            var e = p(this),
              t = e.data("formid"),
              t =
                void 0 !== s["wpforms_" + t] &&
                s["wpforms_" + t].hasOwnProperty("validate")
                  ? s["wpforms_" + t].validate
                  : "undefined" != typeof wpforms_validate
                  ? wpforms_validate
                  : {
                      errorElement: l.isModernMarkupEnabled() ? "em" : "label",
                      errorClass: "wpforms-error",
                      validClass: "wpforms-valid",
                      ignore:
                        ":hidden:not(textarea.wp-editor-area), .wpforms-conditional-hide textarea.wp-editor-area",
                      errorPlacement: function (e, t) {
                        l.isLikertScaleField(t)
                          ? (t.closest("table").hasClass("single-row")
                              ? t.closest(".wpforms-field")
                              : t.closest("tr").find("th")
                            ).append(e)
                          : l.isWrappedField(t)
                          ? t.closest(".wpforms-field").append(e)
                          : l.isDateTimeField(t)
                          ? l.dateTimeErrorPlacement(t, e)
                          : l.isFieldInColumn(t) || l.isFieldHasHint(t)
                          ? t.parent().append(e)
                          : l.isLeadFormsSelect(t)
                          ? t.parent().parent().append(e)
                          : e.insertAfter(t),
                          l.isModernMarkupEnabled() &&
                            e.attr({
                              role: "alert",
                              "aria-label": wpforms_settings.errorMessagePrefix,
                              for: "",
                            });
                      },
                      highlight: function (e, t, r) {
                        var a = p(e),
                          o = a.closest(".wpforms-field"),
                          i = a.attr("name");
                        ("radio" === a.attr("type") ||
                        "checkbox" === a.attr("type")
                          ? o.find('input[name="' + i + '"]')
                          : a
                        )
                          .addClass(t)
                          .removeClass(r),
                          "password" === a.attr("type") &&
                            "" === a.val().trim() &&
                            s.WPFormsPasswordField &&
                            a.data("rule-password-strength") &&
                            a.hasClass("wpforms-field-required") &&
                            WPFormsPasswordField.passwordStrength("", e),
                          o.addClass("wpforms-has-error");
                      },
                      unhighlight: function (e, t, r) {
                        var e = p(e),
                          a = e.closest(".wpforms-field"),
                          o = e.attr("name");
                        ("radio" === e.attr("type") ||
                        "checkbox" === e.attr("type")
                          ? a.find('input[name="' + o + '"]')
                          : e
                        )
                          .addClass(r)
                          .removeClass(t),
                          a.removeClass("wpforms-has-error"),
                          l.isModernMarkupEnabled() &&
                            e.parent().find("em.wpforms-error").remove();
                      },
                      submitHandler: function (r) {
                        function e() {
                          var a = p(r),
                            o = a.find(".wpforms-submit"),
                            e = o.data("alt-text"),
                            t = o.get(0).recaptchaID;
                          if (
                            (a.data("token") &&
                              0 === p(".wpforms-token", a).length &&
                              p(
                                '<input type="hidden" class="wpforms-token" name="wpforms[token]" />'
                              )
                                .val(a.data("token"))
                                .appendTo(a),
                            a.find("#wpforms-field_recaptcha-error").remove(),
                            o.prop("disabled", !0),
                            WPFormsUtils.triggerEvent(
                              a,
                              "wpformsFormSubmitButtonDisable",
                              [a, o]
                            ),
                            e && o.text(e),
                            !l.empty(t) || 0 === t)
                          )
                            return (
                              grecaptcha.execute(t).then(null, function (e) {
                                let t = "label",
                                  r = "";
                                l.isModernMarkupEnabled() &&
                                  ((t = "em"), (r = 'role="alert"')),
                                  (e = null === e ? "" : "<br>" + e);
                                e = `<${t} id="wpforms-field_recaptcha-error" class="wpforms-error" ${r}> ${wpforms_settings.val_recaptcha_fail_msg}${e}</${t}>`;
                                a
                                  .find(".wpforms-recaptcha-container")
                                  .append(e),
                                  o.prop("disabled", !1);
                              }),
                              !1
                            );
                          p(".wpforms-input-temp-name").removeAttr("name"),
                            l.formSubmit(a);
                        }
                        return "function" == typeof wpformsRecaptchaV3Execute
                          ? wpformsRecaptchaV3Execute(e)
                          : e();
                      },
                      invalidHandler: function (e, t) {
                        void 0 !== t.errorList[0] &&
                          l.scrollToError(p(t.errorList[0].element));
                      },
                      onkeyup: WPFormsUtils.debounce(function (e, t) {
                        p(e).hasClass("wpforms-novalidate-onkeyup") ||
                          (9 === t.which && "" === this.elementValue(e)) ||
                          -1 !==
                            p.inArray(
                              t.keyCode,
                              [
                                16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144,
                                225,
                              ]
                            ) ||
                          ((e.name in this.submitted ||
                            e.name in this.invalid) &&
                            this.element(e));
                      }, 1e3),
                      onfocusout: function (e) {
                        var t = !1;
                        p(e).hasClass("wpforms-novalidate-onkeyup") &&
                          !e.value &&
                          (t = !0),
                          (t =
                            this.checkable(e) ||
                            (!(e.name in this.submitted) && this.optional(e))
                              ? t
                              : !0) && this.element(e);
                      },
                      onclick: function (e) {
                        var t = !1,
                          r = (e || {}).type,
                          a = p(e);
                        -1 < ["checkbox", "radio"].indexOf(r) &&
                          ((a = a.hasClass("wpforms-likert-scale-option")
                            ? a.closest("tr")
                            : a.closest(".wpforms-field"))
                            .find("label.wpforms-error, em.wpforms-error")
                            .remove(),
                          (t = !0)),
                          t && this.element(e);
                      },
                    };
            e.validate(t);
          }));
      },
      isFieldInColumn: function (e) {
        return (
          e.parent().hasClass("wpforms-one-half") ||
          e.parent().hasClass("wpforms-two-fifths") ||
          e.parent().hasClass("wpforms-one-fifth")
        );
      },
      isFieldHasHint: function (e) {
        return (
          0 <
          e.nextAll(
            ".wpforms-field-sublabel, .wpforms-field-description, .wpforms-field-limit-text, .wpforms-pass-strength-result"
          ).length
        );
      },
      isDateTimeField: function (e) {
        return (
          e.hasClass("wpforms-timepicker") ||
          e.hasClass("wpforms-datepicker") ||
          (e.is("select") &&
            e.attr("class").match(/date-month|date-day|date-year/))
        );
      },
      isWrappedField: function (e) {
        return (
          "checkbox" === e.attr("type") ||
          "radio" === e.attr("type") ||
          "range" === e.attr("type") ||
          "select" === e.is("select") ||
          1 === e.data("is-wrapped-field") ||
          e.parent().hasClass("iti") ||
          e.hasClass("wpforms-validation-group-member") ||
          e.hasClass("choicesjs-select") ||
          e.hasClass("wpforms-net-promoter-score-option")
        );
      },
      isLikertScaleField: function (e) {
        return e.hasClass("wpforms-likert-scale-option");
      },
      isLeadFormsSelect: function (e) {
        return e.parent().hasClass("wpforms-lead-forms-select");
      },
      dateTimeErrorPlacement: function (e, t) {
        var r = e.closest(".wpforms-field-row-block, .wpforms-field-date-time");
        r.length
          ? r.find("label.wpforms-error, em.wpforms-error").length ||
            r.append(t)
          : e.closest(".wpforms-field").append(t);
      },
      loadDatePicker: function () {
        void 0 !== p.fn.flatpickr &&
          p(".wpforms-datepicker-wrap").each(function () {
            var a = p(this),
              e = a.find("input"),
              t = a.closest(".wpforms-form").data("formid"),
              r = a.closest(".wpforms-field").data("field-id"),
              r =
                void 0 !== s["wpforms_" + t + "_" + r] &&
                s["wpforms_" + t + "_" + r].hasOwnProperty("datepicker")
                  ? s["wpforms_" + t + "_" + r].datepicker
                  : void 0 !== s["wpforms_" + t] &&
                    s["wpforms_" + t].hasOwnProperty("datepicker")
                  ? s["wpforms_" + t].datepicker
                  : "undefined" != typeof wpforms_datepicker
                  ? wpforms_datepicker
                  : { disableMobile: !0 },
              o =
                (!r.hasOwnProperty("locale") &&
                  "undefined" != typeof wpforms_settings &&
                  wpforms_settings.hasOwnProperty("locale") &&
                  (r.locale = wpforms_settings.locale),
                (r.wrap = !0),
                (r.dateFormat = e.data("date-format")),
                1 === e.data("disable-past-dates") && (r.minDate = "today"),
                e.data("limit-days")),
              i = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
            o &&
              "" !== o &&
              ((o = o.split(",")),
              (r.disable = [
                function (e) {
                  for (var t in o)
                    if (i.indexOf(o[t]) === e.getDay()) return !1;
                  return !0;
                },
              ])),
              (r.onChange = function (e, t, r) {
                t = "" === t ? "none" : "block";
                a.find(".wpforms-datepicker-clear").css("display", t);
              }),
              a.flatpickr(r);
          });
      },
      loadTimePicker: function () {
        void 0 !== p.fn.timepicker &&
          p(".wpforms-timepicker").each(function () {
            var e = p(this),
              t = e.closest(".wpforms-form").data("formid"),
              r = e.closest(".wpforms-field").data("field-id"),
              r =
                void 0 !== s["wpforms_" + t + "_" + r] &&
                s["wpforms_" + t + "_" + r].hasOwnProperty("timepicker")
                  ? s["wpforms_" + t + "_" + r].timepicker
                  : void 0 !== s["wpforms_" + t] &&
                    s["wpforms_" + t].hasOwnProperty("timepicker")
                  ? s["wpforms_" + t].timepicker
                  : "undefined" != typeof wpforms_timepicker
                  ? wpforms_timepicker
                  : { scrollDefault: "now", forceRoundTime: !0 };
            e.timepicker(r);
          });
      },
      loadInputMask: function () {
        void 0 !== p.fn.inputmask &&
          p(".wpforms-masked-input").inputmask({ rightAlign: !1 });
      },
      loadSmartPhoneField: function () {
        var a, e, t;
        void 0 !== p.fn.intlTelInput &&
          ((a = {}),
          wpforms_settings.gdpr || (a.geoIpLookup = l.currentIpToCountry),
          wpforms_settings.gdpr &&
            ((e = this.getFirstBrowserLanguage()),
            (t = -1 < e.indexOf("-") ? e.split("-").pop() : "")),
          (t =
            t &&
            (s.intlTelInputGlobals.getCountryData().filter(function (e) {
              return e.iso2 === t.toLowerCase();
            }).length
              ? t
              : "")),
          (a.initialCountry = wpforms_settings.gdpr && t ? t : "auto"),
          p(".wpforms-smart-phone-field").each(function (e, t) {
            var r = p(t);
            (a.hiddenInput = r
              .closest(".wpforms-field-phone")
              .data("field-id")),
              (a.utilsScript =
                wpforms_settings.wpforms_plugin_url +
                "assets/pro/lib/intl-tel-input/jquery.intl-tel-input-utils.min.js"),
              r.intlTelInput(a),
              r.attr("name", "wpf-temp-" + r.attr("name")),
              r.addClass("wpforms-input-temp-name"),
              r.on("blur input", function () {
                (!r.intlTelInput("isValidNumber") &&
                  l.empty(s.WPFormsEditEntry)) ||
                  r
                    .siblings('input[type="hidden"]')
                    .val(r.intlTelInput("getNumber"));
              });
          }),
          p(".wpforms-form").on("wpformsBeforeFormSubmit", function () {
            p(this).find(".wpforms-smart-phone-field").trigger("input");
          }));
      },
      loadPayments: function () {
        p(".wpforms-payment-total").each(function (e, t) {
          l.amountTotal(this);
        }),
          void 0 !== p.fn.payment &&
            (p(".wpforms-field-credit-card-cardnumber").payment(
              "formatCardNumber"
            ),
            p(".wpforms-field-credit-card-cardcvc").payment("formatCardCVC"));
      },
      loadMailcheck: function () {
        wpforms_settings.mailcheck_enabled &&
          void 0 !== p.fn.mailcheck &&
          (0 < wpforms_settings.mailcheck_domains.length &&
            (Mailcheck.defaultDomains = Mailcheck.defaultDomains.concat(
              wpforms_settings.mailcheck_domains
            )),
          0 < wpforms_settings.mailcheck_toplevel_domains.length &&
            (Mailcheck.defaultTopLevelDomains =
              Mailcheck.defaultTopLevelDomains.concat(
                wpforms_settings.mailcheck_toplevel_domains
              )),
          p(n).on("blur", ".wpforms-field-email input", function () {
            var e = p(this),
              o = e.attr("id");
            e.mailcheck({
              suggested: function (e, t) {
                t.address.match(/^xn--/) &&
                  ((t.full = punycode.toUnicode(decodeURI(t.full))),
                  (r = t.full.split("@")),
                  (t.address = r[0]),
                  (t.domain = r[1])),
                  t.domain.match(/^xn--/) &&
                    (t.domain = punycode.toUnicode(decodeURI(t.domain)));
                var r = decodeURI(t.address)
                    .replaceAll(/[<>'"()/\\|:;=@%&\s]/gi, "")
                    .substr(0, 64),
                  a = decodeURI(t.domain).replaceAll(
                    /[<>'"()/\\|:;=@%&+_\s]/gi,
                    ""
                  );
                (t =
                  '<a href="#" class="mailcheck-suggestion" data-id="' +
                  o +
                  '" title="' +
                  wpforms_settings.val_email_suggestion_title +
                  '">' +
                  r +
                  "@" +
                  a +
                  "</a>"),
                  (t = wpforms_settings.val_email_suggestion.replace(
                    "{suggestion}",
                    t
                  )),
                  e
                    .closest(".wpforms-field")
                    .find("#" + o + "_suggestion")
                    .remove(),
                  e
                    .parent()
                    .append(
                      '<label class="wpforms-error mailcheck-error" id="' +
                        o +
                        '_suggestion">' +
                        t +
                        "</label>"
                    );
              },
              empty: function () {
                p("#" + o + "_suggestion").remove();
              },
            });
          }),
          p(n).on(
            "click",
            ".wpforms-field-email .mailcheck-suggestion",
            function (e) {
              var t = p(this),
                r = t.closest(".wpforms-field"),
                a = t.data("id");
              e.preventDefault(),
                r.find("#" + a).val(t.text()),
                t.parent().remove();
            }
          ));
      },
      loadChoicesJS: function () {
        "function" == typeof s.Choices &&
          p(
            ".wpforms-field-select-style-modern .choicesjs-select, .wpforms-field-payment-select .choicesjs-select"
          ).each(function (e, t) {
            var r, a;
            p(t).data("choicesjs") ||
              ((r = s.wpforms_choicesjs_config || {}),
              (a = p(t).data("search-enabled")),
              (r.searchEnabled = void 0 === a || a),
              (r.callbackOnInit = function () {
                var t = this,
                  r = p(t.passedElement.element),
                  a = p(t.input.element),
                  e = r.data("size-class");
                r
                  .removeAttr("hidden")
                  .addClass(t.config.classNames.input + "--hidden"),
                  e && p(t.containerOuter.element).addClass(e),
                  r.prop("multiple") &&
                    (a.data("placeholder", a.attr("placeholder")),
                    t.getValue(!0).length) &&
                    a.removeAttr("placeholder"),
                  r.on("change", function () {
                    var e;
                    r.prop("multiple") &&
                      (t.getValue(!0).length
                        ? a.removeAttr("placeholder")
                        : a.attr("placeholder", a.data("placeholder"))),
                      (e = r.closest("form").data("validator")) && e.element(r);
                  });
              }),
              (r.callbackOnCreateTemplates = function () {
                var r = p(this.passedElement.element);
                return {
                  option: function (e) {
                    var t = Choices.defaults.templates.option.call(this, e);
                    return (
                      void 0 !== e.placeholder &&
                        !0 === e.placeholder &&
                        t.classList.add("placeholder"),
                      r.hasClass("wpforms-payment-price") &&
                        void 0 !== e.customProperties &&
                        null !== e.customProperties &&
                        (t.dataset.amount = e.customProperties),
                      t
                    );
                  },
                };
              }),
              p(t).data("choicesjs", new Choices(t, r)));
          });
      },
      bindUIActions: function () {
        p(n).on("click", ".wpforms-page-button", function (e) {
          e.preventDefault(), l.pagebreakNav(this);
        }),
          p(n).on("change input", ".wpforms-payment-price", function () {
            l.amountTotal(this, !0);
          }),
          p(n).on("input", ".wpforms-payment-user-input", function () {
            var e = p(this),
              t = e.val();
            e.val(t.replace(/[^0-9.,]/g, ""));
          }),
          p(n).on("focusout", ".wpforms-payment-user-input", function () {
            var e = p(this),
              t = e.val();
            if (!t) return t;
            (t = l.amountSanitize(t)), (t = l.amountFormat(t));
            e.val(t);
          }),
          p(n).on("wpformsProcessConditionals", function (e, t) {
            l.amountTotal(t, !0);
          }),
          p(n)
            .on("mouseenter", ".wpforms-field-rating-item", function () {
              p(this)
                .parent()
                .find(".wpforms-field-rating-item")
                .removeClass("selected hover"),
                p(this).prevAll().addBack().addClass("hover");
            })
            .on("mouseleave", ".wpforms-field-rating-item", function () {
              p(this)
                .parent()
                .find(".wpforms-field-rating-item")
                .removeClass("selected hover"),
                p(this)
                  .parent()
                  .find("input:checked")
                  .parent()
                  .prevAll()
                  .addBack()
                  .addClass("selected");
            }),
          p(n).on("change", ".wpforms-field-rating-item input", function () {
            var e = p(this);
            e
              .closest(".wpforms-field-rating-items")
              .find(".wpforms-field-rating-item")
              .removeClass("hover selected"),
              e.parent().prevAll().addBack().addClass("selected");
          }),
          p(function () {
            p(".wpforms-field-rating-item input:checked").trigger("change");
          }),
          p(n).on("keydown", ".wpforms-image-choices-item label", function (e) {
            var t = p(this);
            if (
              t.closest(".wpforms-field").hasClass("wpforms-conditional-hide")
            )
              return e.preventDefault(), !1;
            32 === e.keyCode &&
              (t.find("input").trigger("click"), e.preventDefault());
          }),
          s.document.documentMode &&
            p(n).on("click", ".wpforms-image-choices-item img", function () {
              p(this).closest("label").find("input").trigger("click");
            }),
          p(n).on(
            "change",
            ".wpforms-field-checkbox input, .wpforms-field-radio input, .wpforms-field-payment-multiple input, .wpforms-field-payment-checkbox input, .wpforms-field-gdpr-checkbox input",
            function (e) {
              var t = p(this);
              if (
                t.closest(".wpforms-field").hasClass("wpforms-conditional-hide")
              )
                return e.preventDefault(), !1;
              switch (t.attr("type")) {
                case "radio":
                  t
                    .closest("ul")
                    .find("li")
                    .removeClass("wpforms-selected")
                    .find("input[type=radio]")
                    .removeProp("checked"),
                    t
                      .prop("checked", !0)
                      .closest("li")
                      .addClass("wpforms-selected");
                  break;
                case "checkbox":
                  t.is(":checked")
                    ? (t.closest("li").addClass("wpforms-selected"),
                      t.prop("checked", !0))
                    : (t.closest("li").removeClass("wpforms-selected"),
                      t.prop("checked", !1));
              }
            }
          ),
          p(n).on(
            "change",
            '.wpforms-field-file-upload input[type=file]:not(".dropzone-input")',
            function () {
              var e = p(this),
                t = e
                  .closest("form.wpforms-form")
                  .find(
                    '.wpforms-field-file-upload input:not(".dropzone-input")'
                  ),
                a = 0,
                r = Number(wpforms_settings.post_max_size),
                o =
                  '<div class="wpforms-error-container-post_max_size">' +
                  wpforms_settings.val_post_max_size +
                  "</div>",
                e = e
                  .closest("form.wpforms-form")
                  .find(".wpforms-submit-container"),
                i = e.find("button.wpforms-submit"),
                n = e.prev(),
                s = i.closest("form");
              t.each(function () {
                for (var e = p(this), t = 0, r = e[0].files.length; t < r; t++)
                  a += e[0].files[t].size;
              }),
                a < r
                  ? (n.find(".wpforms-error-container-post_max_size").remove(),
                    i.prop("disabled", !1),
                    WPFormsUtils.triggerEvent(
                      s,
                      "wpformsCombinedUploadsSizeOk",
                      [s, n]
                    ))
                  : ((a = Number((a / 1048576).toFixed(3))),
                    (r = Number((r / 1048576).toFixed(3))),
                    (o = o.replace(/{totalSize}/, a).replace(/{maxSize}/, r)),
                    n.hasClass("wpforms-error-container")
                      ? (n
                          .find(".wpforms-error-container-post_max_size")
                          .remove(),
                        n.append(o))
                      : (e.before(
                          '<div class="wpforms-error-container">{errorMsg}</div>'.replace(
                            /{errorMsg}/,
                            o
                          )
                        ),
                        (n = e.prev())),
                    i.prop("disabled", !0),
                    WPFormsUtils.triggerEvent(
                      s,
                      "wpformsCombinedUploadsSizeError",
                      [s, n]
                    ));
            }
          ),
          p(n).on(
            "change input",
            ".wpforms-field-number-slider input[type=range]",
            function (e) {
              var t = p(e.target).siblings(".wpforms-field-number-slider-hint");
              t.html(
                t
                  .data("hint")
                  .replace("{value}", "<b>" + e.target.value + "</b>")
              );
            }
          ),
          p(n).on("keydown", ".wpforms-form input", function (e) {
            var t, r;
            13 !== e.keyCode ||
              0 === (r = (t = p(this)).closest(".wpforms-page")).length ||
              [
                "text",
                "tel",
                "number",
                "email",
                "url",
                "radio",
                "checkbox",
              ].indexOf(t.attr("type")) < 0 ||
              (t.hasClass("wpforms-datepicker") && t.flatpickr("close"),
              e.preventDefault(),
              (r.hasClass("last")
                ? r.closest(".wpforms-form").find(".wpforms-submit")
                : r.find(".wpforms-page-next")
              ).trigger("click"));
          }),
          p(n).on("keypress", ".wpforms-field-number input", function (e) {
            return /^[-0-9.]+$/.test(String.fromCharCode(e.keyCode || e.which));
          });
      },
      entryPreviewFieldPageChange: function (e, t, r) {
        console.warn(
          "WARNING! Obsolete function called. Function wpforms.entryPreviewFieldPageChange has been deprecated, please use the WPFormsEntryPreview.pageChange function instead!"
        ),
          WPFormsEntryPreview.pageChange(e, t, r);
      },
      entryPreviewFieldUpdate: function (e, t) {
        console.warn(
          "WARNING! Obsolete function called. Function wpforms.entryPreviewFieldUpdate has been deprecated, please use the WPFormsEntryPreview.update function instead!"
        ),
          WPFormsEntryPreview.update(e, t);
      },
      scrollToError: function (e) {
        var t, r;
        0 !== e.length &&
          0 !==
            (t =
              0 === (t = e.find(".wpforms-field.wpforms-has-error")).length
                ? e.closest(".wpforms-field")
                : t).length &&
          void 0 !== (r = t.offset()) &&
          l.animateScrollTop(r.top - 75, 750).done(function () {
            var e = t.find(".wpforms-error").first();
            "function" == typeof e.focus && e.trigger("focus");
          });
      },
      pagebreakNav: function (e) {
        const t = p(e),
          r = t.data("action"),
          a = t.data("page"),
          o = t.closest(".wpforms-form"),
          i = o.find(".wpforms-page-" + a);
        l.saveTinyMCE(),
          "next" === r && void 0 !== p.fn.validate
            ? l.checkForInvalidFields(o, i, function () {
                l.navigateToPage(t, r, a, o, i);
              })
            : ("prev" !== r && "next" !== r) || l.navigateToPage(t, r, a, o, i);
      },
      checkForInvalidFields: function (e, t, a) {
        var r = e.data("validator");
        if (r)
          if (0 < r.pendingRequest)
            setTimeout(function () {
              l.checkForInvalidFields(e, t, a);
            }, 800);
          else {
            let r = !0;
            t.find(":input").each(function (e, t) {
              !p(t).attr("name") || p(t).valid() || (r = !1);
            }),
              r ? a() : l.scrollToError(t);
          }
      },
      navigateToPage: function (e, t, r, a, o) {
        let i = r;
        "next" === t ? (i += 1) : "prev" === t && --i,
          WPFormsUtils.triggerEvent(e, "wpformsBeforePageChange", [
            i,
            a,
            t,
          ]).isDefaultPrevented() ||
            (a.find(".wpforms-page").hide(),
            (r = a.find(".wpforms-page-" + i)).show(),
            l.toggleReCaptchaAndSubmitDisplay(a, t, r),
            (r = l.getPageScroll(a)) &&
              l.animateScrollTop(a.offset().top - r, 750, null),
            e.trigger("wpformsPageChange", [i, a, t]),
            l.manipulateIndicator(i, a));
      },
      toggleReCaptchaAndSubmitDisplay: function (e, t, r) {
        var a = e.find(".wpforms-submit-container"),
          e = e.find(".wpforms-recaptcha-container");
        "next" === t && r.hasClass("last")
          ? (e.show(), a.show())
          : "prev" === t && (e.hide(), a.hide());
      },
      getPageScroll: function (e) {
        return (
          !1 !== s.wpforms_pageScroll &&
          (l.empty(s.wpform_pageScroll)
            ? 0 !== e.find(".wpforms-page-indicator").data("scroll") && 75
            : s.wpform_pageScroll)
        );
      },
      manipulateIndicator: function (e, t) {
        var r,
          a = t.find(".wpforms-page-indicator");
        a &&
          ("connector" === (r = a.data("indicator")) || "circles" === r
            ? l.manipulateConnectorAndCirclesIndicator(a, r, e)
            : "progress" === r && l.manipulateProgressIndicator(a, t, e));
      },
      manipulateConnectorAndCirclesIndicator: function (e, t, r) {
        var a = e.data("indicator-color");
        e.find(".wpforms-page-indicator-page").removeClass("active"),
          e.find(".wpforms-page-indicator-page-" + r).addClass("active"),
          e.find(".wpforms-page-indicator-page-number").removeAttr("style"),
          e
            .find(".active .wpforms-page-indicator-page-number")
            .css("background-color", a),
          "connector" === t &&
            (e
              .find(".wpforms-page-indicator-page-triangle")
              .removeAttr("style"),
            e
              .find(".active .wpforms-page-indicator-page-triangle")
              .css("border-top-color", a));
      },
      manipulateProgressIndicator: function (e, t, r) {
        var a = e.find(".wpforms-page-indicator-page-title"),
          o = e.find(".wpforms-page-indicator-page-title-sep"),
          t = (r / t.find(".wpforms-page").length) * 100;
        e.find(".wpforms-page-indicator-page-progress").css("width", t + "%"),
          e.find(".wpforms-page-indicator-steps-current").text(r),
          a.data("page-" + r + "-title")
            ? (a.css("display", "inline").text(a.data("page-" + r + "-title")),
              o.css("display", "inline"))
            : (a.css("display", "none"), o.css("display", "none"));
      },
      bindOptinMonster: function () {
        n.addEventListener("om.Campaign.load", function (e) {
          l.ready(), l.optinMonsterRecaptchaReset(e.detail.Campaign.data.id);
        }),
          p(n).on("OptinMonsterOnShow", function (e, t, r) {
            l.ready(), l.optinMonsterRecaptchaReset(t.optin);
          });
      },
      optinMonsterRecaptchaReset: function (e) {
        var t,
          r,
          e = p("#om-" + e).find(".wpforms-form"),
          a = e.find(".wpforms-recaptcha-container"),
          o = e.find(".g-recaptcha");
        e.length &&
          o.length &&
          ((e = o.attr("data-sitekey")),
          (t = "recaptcha-" + Date.now()),
          (r = a.hasClass("wpforms-is-hcaptcha") ? hcaptcha : grecaptcha),
          o.remove(),
          a.prepend(
            '<div class="g-recaptcha" id="' +
              t +
              '" data-sitekey="' +
              e +
              '"></div>'
          ),
          r.render(t, {
            sitekey: e,
            callback: function () {
              wpformsRecaptchaCallback(p("#" + t));
            },
          }));
      },
      amountTotal: function (e, r) {
        r = r || !1;
        var a = p(e).closest(".wpforms-form"),
          e = l.getCurrency(),
          t = l.amountTotalCalc(a),
          t = l.amountFormat(t),
          o = "left" === e.symbol_pos ? e.symbol + " " + t : t + " " + e.symbol;
        a.find(".wpforms-payment-total").each(function (e, t) {
          "hidden" === p(this).attr("type") || "text" === p(this).attr("type")
            ? (p(this).val(o),
              "text" === p(this).attr("type") &&
                r &&
                a.data("validator") &&
                p(this).valid())
            : p(this).text(o);
        });
      },
      amountTotalCalc: function (e) {
        var a = 0;
        return (
          p(".wpforms-payment-price", e).each(function () {
            var e = 0,
              t = p(this),
              r = t.attr("type");
            t
              .closest(".wpforms-field-payment-single")
              .hasClass("wpforms-conditional-hide") ||
              ("text" === r || "hidden" === r
                ? (e = t.val())
                : ("radio" !== r && "checkbox" !== r) || !t.is(":checked")
                ? t.is("select") &&
                  0 < t.find("option:selected").length &&
                  (e = t.find("option:selected").data("amount"))
                : (e = t.data("amount")),
              l.empty(e)) ||
              ((e = l.amountSanitize(e)), (a = Number(a) + Number(e)));
          }),
          p(n).trigger("wpformsAmountTotalCalculated", [e, a]),
          a
        );
      },
      amountSanitize: function (e) {
        var t = l.getCurrency();
        return (
          (e = e.toString().replace(/[^0-9.,]/g, "")),
          "," === t.decimal_sep
            ? ("." === t.thousands_sep && -1 !== e.indexOf(t.thousands_sep)
                ? (e = e.replace(new RegExp("\\" + t.thousands_sep, "g"), ""))
                : "" === t.thousands_sep &&
                  -1 !== e.indexOf(".") &&
                  (e = e.replace(/\./g, "")),
              (e = e.replace(t.decimal_sep, ".")))
            : "," === t.thousands_sep &&
              -1 !== e.indexOf(t.thousands_sep) &&
              (e = e.replace(new RegExp("\\" + t.thousands_sep, "g"), "")),
          l.numberFormat(e, t.decimals, ".", "")
        );
      },
      amountFormat: function (e) {
        var t,
          r = l.getCurrency();
        return (
          (e = String(e)),
          "," === r.decimal_sep &&
            -1 !== e.indexOf(r.decimal_sep) &&
            ((t = e.indexOf(r.decimal_sep)),
            (e = e.substr(0, t) + "." + e.substr(t + 1, e.length - 1))),
          "," === r.thousands_sep &&
            -1 !== e.indexOf(r.thousands_sep) &&
            (e = e.replace(/,/g, "")),
          l.empty(e) && (e = 0),
          l.numberFormat(e, r.decimals, r.decimal_sep, r.thousands_sep)
        );
      },
      getCurrency: function () {
        var e = {
          code: "USD",
          thousands_sep: ",",
          decimals: 2,
          decimal_sep: ".",
          symbol: "$",
          symbol_pos: "left",
        };
        return (
          void 0 !== wpforms_settings.currency_code &&
            (e.code = wpforms_settings.currency_code),
          void 0 !== wpforms_settings.currency_thousands &&
            (e.thousands_sep = wpforms_settings.currency_thousands),
          void 0 !== wpforms_settings.currency_decimals &&
            (e.decimals = wpforms_settings.currency_decimals),
          void 0 !== wpforms_settings.currency_decimal &&
            (e.decimal_sep = wpforms_settings.currency_decimal),
          void 0 !== wpforms_settings.currency_symbol &&
            (e.symbol = wpforms_settings.currency_symbol),
          void 0 !== wpforms_settings.currency_symbol_pos &&
            (e.symbol_pos = wpforms_settings.currency_symbol_pos),
          e
        );
      },
      numberFormat: function (e, t, r, a) {
        e = (e + "").replace(/[^0-9+\-Ee.]/g, "");
        var o,
          i,
          e = isFinite(+e) ? +e : 0,
          t = isFinite(+t) ? Math.abs(t) : 0,
          a = void 0 === a ? "," : a,
          r = void 0 === r ? "." : r,
          n = (
            t
              ? ((n = e),
                (o = t),
                (i = Math.pow(10, o)),
                "" + (Math.round(n * i) / i).toFixed(o))
              : "" + Math.round(e)
          ).split(".");
        return (
          3 < n[0].length &&
            (n[0] = n[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, a)),
          (n[1] || "").length < t &&
            ((n[1] = n[1] || ""),
            (n[1] += new Array(t - n[1].length + 1).join("0"))),
          n.join(r)
        );
      },
      empty: function (e) {
        for (
          var t, r = [void 0, null, !1, 0, "", "0"], a = 0, o = r.length;
          a < o;
          a++
        )
          if (e === r[a]) return !0;
        if ("object" != typeof e) return !1;
        for (t in e) if (e.hasOwnProperty(t)) return !1;
        return !0;
      },
      setUserIndentifier: function () {
        if (
          ((!s.hasRequiredConsent &&
            "undefined" != typeof wpforms_settings &&
            wpforms_settings.uuid_cookie) ||
            (s.hasRequiredConsent && s.hasRequiredConsent())) &&
          !l.getCookie("_wpfuuid")
        ) {
          for (
            var e, t = new Array(36), r = "0123456789abcdef", a = 0;
            a < 36;
            a++
          )
            t[a] = r.substr(Math.floor(16 * Math.random()), 1);
          (t[14] = "4"),
            (t[19] = r.substr((3 & t[19]) | 8, 1)),
            (t[8] = t[13] = t[18] = t[23] = "-"),
            (e = t.join("")),
            l.createCookie("_wpfuuid", e, 3999);
        }
      },
      createCookie: function (e, t, r) {
        var a,
          o = "",
          i = "";
        wpforms_settings.is_ssl && (i = ";secure"),
          (o = r
            ? "-1" === r
              ? ""
              : ((a = new Date()).setTime(a.getTime() + 24 * r * 60 * 60 * 1e3),
                ";expires=" + a.toGMTString())
            : ";expires=Thu, 01 Jan 1970 00:00:01 GMT"),
          (n.cookie = e + "=" + t + o + ";path=/;samesite=strict" + i);
      },
      getCookie: function (e) {
        for (
          var t = e + "=", r = n.cookie.split(";"), a = 0;
          a < r.length;
          a++
        ) {
          for (var o = r[a]; " " === o.charAt(0); )
            o = o.substring(1, o.length);
          if (0 === o.indexOf(t)) return o.substring(t.length, o.length);
        }
        return null;
      },
      removeCookie: function (e) {
        l.createCookie(e, "", -1);
      },
      getFirstBrowserLanguage: function () {
        var e,
          t,
          r = s.navigator,
          a = ["language", "browserLanguage", "systemLanguage", "userLanguage"];
        if (Array.isArray(r.languages))
          for (e = 0; e < r.languages.length; e++)
            if ((t = r.languages[e]) && t.length) return t;
        for (e = 0; e < a.length; e++) if ((t = r[a[e]]) && t.length) return t;
        return "";
      },
      currentIpToCountry: function (r) {
        function t() {
          p.get("https://ipapi.co/jsonp", function () {}, "jsonp").always(
            function (e) {
              var t,
                e = e && e.country ? e.country : "";
              e ||
                (e =
                  -1 < (t = l.getFirstBrowserLanguage()).indexOf("-")
                    ? t.split("-").pop()
                    : ""),
                r(e);
            }
          );
        }
        p.get("https://geo.wpforms.com/v3/geolocate/json")
          .done(function (e) {
            e && e.country_iso ? r(e.country_iso) : t();
          })
          .fail(function (e) {
            t();
          });
      },
      formSubmit: function (e) {
        e instanceof jQuery || (e = p(e)),
          l.saveTinyMCE(),
          WPFormsUtils.triggerEvent(e, "wpformsBeforeFormSubmit", [
            e,
          ]).isDefaultPrevented()
            ? l.restoreSubmitButton(e, e.closest(".wpforms-container"))
            : e.hasClass("wpforms-ajax-form") && "undefined" != typeof FormData
            ? l.formSubmitAjax(e)
            : l.formSubmitNormal(e);
      },
      restoreSubmitButton: function (e, t) {
        var r = e.find(".wpforms-submit"),
          a = r.data("submit-text");
        a && r.text(a),
          r.prop("disabled", !1),
          WPFormsUtils.triggerEvent(e, "wpformsFormSubmitButtonRestore", [
            e,
            r,
          ]),
          t.css("opacity", ""),
          e.find(".wpforms-submit-spinner").hide();
      },
      formSubmitNormal: function (e) {
        var t, r;
        e.length &&
          ((r = (t = e.find(".wpforms-submit")).get(0).recaptchaID),
          (l.empty(r) && 0 !== r) || (t.get(0).recaptchaID = !1),
          e.get(0).submit());
      },
      formHasCaptcha: function (e) {
        return (
          !(
            !e ||
            !e.length ||
            ("undefined" == typeof hcaptcha &&
              "undefined" == typeof grecaptcha &&
              "undefined" == typeof turnstile)
          ) && ((e = e.find(".wpforms-recaptcha-container")), Boolean(e.length))
        );
      },
      resetFormRecaptcha: function (e) {
        var t, r;
        l.formHasCaptcha(e) &&
          ((t = (t = e.find(".wpforms-recaptcha-container")).hasClass(
            "wpforms-is-hcaptcha"
          )
            ? hcaptcha
            : t.hasClass("wpforms-is-turnstile")
            ? turnstile
            : grecaptcha),
          (r = e.find(".wpforms-submit").get(0).recaptchaID),
          l.empty(r) &&
            0 !== r &&
            (r = e.find(".g-recaptcha").data("recaptcha-id")),
          (l.empty(r) && 0 !== r) || t.reset(r));
      },
      consoleLogAjaxError: function (e) {
        e
          ? console.error("WPForms AJAX submit error:\n%s", e)
          : console.error("WPForms AJAX submit error");
      },
      displayFormAjaxErrors: function (e, t) {
        "string" == typeof t
          ? l.displayFormAjaxGeneralErrors(e, t)
          : ((t = t && "errors" in t ? t.errors : null),
            l.empty(t) || (l.empty(t.general) && l.empty(t.field))
              ? l.consoleLogAjaxError()
              : (l.empty(t.general) ||
                  l.displayFormAjaxGeneralErrors(e, t.general),
                l.empty(t.field) || l.displayFormAjaxFieldErrors(e, t.field)));
      },
      displayFormAjaxGeneralErrors: function (a, e) {
        if (a && a.length && !l.empty(e)) {
          const o = a.data("formid");
          var t, r;
          l.isModernMarkupEnabled() &&
            a.attr({ "aria-invalid": "true", "aria-errormessage": "" }),
            "string" == typeof e
              ? ((t = l.isModernMarkupEnabled() ? ' role="alert"' : ""),
                (r = l.isModernMarkupEnabled()
                  ? `<span class="wpforms-hidden">${wpforms_settings.formErrorMessagePrefix}</span>`
                  : ""),
                a
                  .find(".wpforms-submit-container")
                  .before(
                    `<div class="wpforms-error-container"${t}>${r}${e}</div>`
                  ))
              : p.each(e, function (e, t) {
                  switch (e) {
                    case "header":
                      a.prepend(t);
                      break;
                    case "footer":
                      a.find(".wpforms-submit-container").before(t);
                      break;
                    case "recaptcha":
                      a.find(".wpforms-recaptcha-container").append(t);
                  }
                  var r;
                  l.isModernMarkupEnabled() &&
                    ((r = a.attr("aria-errormessage") || ""),
                    a.attr(
                      "aria-errormessage",
                      `${r} wpforms-${o}-${e}-error`
                    ));
                });
        }
      },
      clearFormAjaxGeneralErrors: function (e) {
        e.find(".wpforms-error-container").remove(),
          e.find("#wpforms-field_recaptcha-error").remove(),
          l.isModernMarkupEnabled() &&
            e.attr({ "aria-invalid": "false", "aria-errormessage": "" });
      },
      displayFormAjaxFieldErrors: function (e, t) {
        var r;
        e &&
          e.length &&
          (l.empty(t) ||
            ((r = e.data("validator")) &&
              (r.showErrors(t), l.formHasCaptcha(e) || r.focusInvalid())));
      },
      formSubmitAjax: function (a) {
        var r, t, e;
        return a.length
          ? ((r = a.closest(".wpforms-container")),
            (e = a.find(".wpforms-submit-spinner")),
            r.css("opacity", 0.6),
            e.show(),
            l.clearFormAjaxGeneralErrors(a),
            (e = new FormData(a.get(0))).append("action", "wpforms_submit"),
            e.append("page_url", s.location.href),
            e.append("page_title", wpforms_settings.page_title),
            e.append("page_id", wpforms_settings.page_id),
            (e = {
              type: "post",
              dataType: "json",
              url: wpforms_settings.ajaxurl,
              data: e,
              cache: !1,
              contentType: !1,
              processData: !1,
              success: function (e) {
                e
                  ? e.data && e.data.action_required
                    ? a.trigger("wpformsAjaxSubmitActionRequired", e)
                    : e.success
                    ? (a.trigger("wpformsAjaxSubmitSuccess", e),
                      e.data &&
                        (e.data.redirect_url
                          ? (a.trigger("wpformsAjaxSubmitBeforeRedirect", e),
                            (s.location = e.data.redirect_url))
                          : e.data.confirmation &&
                            (r.html(e.data.confirmation),
                            (t = r.find("div.wpforms-confirmation-scroll")),
                            r.trigger(
                              "wpformsAjaxSubmitSuccessConfirmation",
                              e
                            ),
                            t.length) &&
                            l.animateScrollTop(t.offset().top - 100)))
                    : (l.resetFormRecaptcha(a),
                      l.displayFormAjaxErrors(a, e.data),
                      a.trigger("wpformsAjaxSubmitFailed", e),
                      l.setCurrentPage(a, e.data))
                  : l.consoleLogAjaxError();
              },
              error: function (e, t, r) {
                l.consoleLogAjaxError(r),
                  a.trigger("wpformsAjaxSubmitError", [e, t, r]);
              },
              complete: function (e, t) {
                (e.responseJSON &&
                  e.responseJSON.data &&
                  (e.responseJSON.data.action_required ||
                    ("success" === t && e.responseJSON.data.redirect_url))) ||
                  (l.restoreSubmitButton(a, r),
                  a.trigger("wpformsAjaxSubmitCompleted", [e, t]));
              },
            }),
            WPFormsUtils.triggerEvent(a, "wpformsAjaxBeforeSubmit", [
              a,
            ]).isDefaultPrevented()
              ? (l.restoreSubmitButton(a, r), p.Deferred().reject())
              : p.ajax(e))
          : p.Deferred().reject();
      },
      setCurrentPage: function (a, o) {
        if (0 !== a.find(".wpforms-page-indicator").length) {
          let r = [];
          a.find(".wpforms-page").each(function (e, t) {
            if (1 <= p(t).find(".wpforms-has-error").length)
              return r.push(p(t));
          });
          var i = 0 < r.length ? r[0] : a.find(".wpforms-page-1");
          let e,
            t = "prev";
          1 === i.data("page") || void 0 !== o.errors.general.footer
            ? (e = a.find(".wpforms-page-1").next())
            : ((e = 0 !== i.next().length ? i.next() : i.prev()),
              (t = 0 !== i.next().length ? "prev" : "next"));
          (o = e.find(".wpforms-page-next")), (i = e.data("page"));
          l.navigateToPage(o, t, i, a, p(".wpforms-page-" + i));
        }
      },
      animateScrollTop: function (e, t, r) {
        return (
          (t = t || 1e3),
          (r = "function" == typeof r ? r : function () {}),
          p("html, body")
            .animate(
              { scrollTop: parseInt(e, 10) },
              { duration: t, complete: r }
            )
            .promise()
        );
      },
      saveTinyMCE: function () {
        "undefined" != typeof tinyMCE && tinyMCE.triggerSave();
      },
      isFunction: function (e) {
        return !!(e && e.constructor && e.call && e.apply);
      },
      compareTimesGreaterThan: function (e, t) {
        (e = e.replace(/(am|pm)/g, " $1").toUpperCase()),
          (t = t.replace(/(am|pm)/g, " $1").toUpperCase());
        e = Date.parse("01 Jan 2021 " + e);
        return Date.parse("01 Jan 2021 " + t) <= e;
      },
      isModernMarkupEnabled: function () {
        return !!wpforms_settings.isModernMarkupEnabled;
      },
    };
    return l;
  })(document, window, jQuery);
wpforms.init();
