import $ from "jquery";
const OfferJs = function () {

    function openReportWindow(id) {
        var maxWidth = screen.availWidth - 300;
        var maxHeight = screen.availHeight - 100;
        var args = "toolbar = no, location=no,status=no, menubar=no, scrollbars = yes, resizable = no, width =" + maxWidth + ", height = " + maxHeight;
        window.open("GetReport.aspx?id=" + id, "_blank", args);
    }

    function ComputeTotal(id) {
        var amount = document.getElementById("tbAmount" + id).value;
        var unitPrice = document.getElementById("tbUnitPrice" + id).value;

        amount = amount.replace(',', '.');
        unitPrice = unitPrice.replace(',', '.');

        document.getElementById("tbTotal" + id).value = (amount * unitPrice);

        document.getElementById("tbTotal" + id).value = document.getElementById("tbTotal" + id).value.replace('.', ',')

        document.getElementById("tbAmount" + id).value = amount.replace('.', ',');
        document.getElementById("tbUnitPrice" + id).value = unitPrice.replace('.', ',');
    }

    function ComputeTimes(id, timetoLessDan, timtoDan, timeToHighDan) {
        var dangerClass = document.getElementById("ddlDangerClass" + id).value;
        var perCount = document.getElementById("tbPerCount" + id).value;

        if (dangerClass == 'Az Tehlikeli') {
            var com = (perCount * timetoLessDan);
            document.getElementById("tbAmount" + id).value = Math.ceil(com / 60.00);
        }
        else if (dangerClass == 'Tehlikeli') {
            var com = (perCount * timtoDan);
            document.getElementById("tbAmount" + id).value = Math.ceil(com / 60.00);
        }
        else if (dangerClass == 'Çok Tehlikeli') {
            var com = (perCount * timeToHighDan);
            document.getElementById("tbAmount" + id).value = Math.ceil(com / 60.00);
        }

        ComputeTotal(id);
    }

    function confirm() {
        $("#dialog-confirm").css("visibility", "visible");
        $("#dialog-confirm").html("Ücretlendirmeyi onaylıyor musunuz?");


        $(".ui-dialog-titlebar-close").text("x")
        $(function () {


            $("#dialog-confirm").dialog({
                resizable: false,
                position: { my: "center top", at: "center top", of: window },
                modal: true,
                buttons: {
                    "Evet": function () {

                        $(this).dialog("close");
                        document.getElementById("<%=btnKaydet2.ClientID %>").click();

                    },
                    "Hayır": function () {
                        $(this).dialog("close");
                        return false;
                    }
                }
            });

        });

    }

    function confirm2() {
        $("#dialog-confirm2").css("visibility", "visible");
        $("#dialog-confirm2").html("<span style='color:red;'>Teklifi,<b> Fatura Ve Ödeme Bilgileri</b>ni girmeden <b>Olumlu</b> Olarak kayıt edemezsiniz</span>");
        $(".ui-dialog-titlebar-close").text("x")
        $(function () {
            $(".ui-dialog-titlebar-close").text("x")

            $("#dialog-confirm2").dialog({
                resizable: false,
                position: { my: "center top", at: "center top", of: window },
                modal: true,
                buttons: {
                    "Tamam": function () {

                        $(this).dialog("close");
                        return false;
                    }
                }
            });

        });
    }
    function ServiceChecked(id) {
        var tr = document.getElementById("tr" + id);

        if ($("#cbCheck" + id).is(':checked'))
            $("#tr" + id).addClass("trchecked");
        else {
            $("#tr" + id).removeClass("trchecked");
        }
    }
    function documentReady() {

        var percent = 0;
        var control2 = $(".txtKaynak").val()
        var Itemss = $(".HiddenKaynak textarea").text()
        var says = 0;
        $(document).on("click", "input,textarea", function () {
            var sa = $(".ServiceTYPEControl").find("input:eq(1)").val()

            if (sa == "-Seçiniz-") {
                alert("Teklif Türünü Seçiniz")
            }

        })

        $(document).delegate(".t1 .tr input", "change", function () {
            trSy()

        })
        $(document).delegate(".percent_cal", "keyup", function () {
            trSy()

        })
        $(document).delegate(".percent_cal", "click", function () {
            if ($(".percent_cal").val() != '') {

                trSy()
            }

        })
        setTimeout(() => {
                trSy() 
        }, 2000);
   
        function trSy() {


            var say = 0
            percent = 0;
            says = 0
            $(".sys").remove();
            for (var i = 0; i < $(".t1 .tr").length; i++) {
                say = $(".t1 .tr:eq(" + i + ") td:eq(9) input").val()

                if (say != NaN && say != "") {
                    says = says + parseInt(say);
                }

            }
            percent = says

            if ($(".percent_cal").val() != '') {
                percent = (says / 100) * $(".percent_cal").val()
                $(".syt2").append("<b class='sys'>Genel Toplam:&nbsp;" + (says - percent).toFixed() + "₺</b>")
                $(".generalTotalText").val((says - percent).toFixed())
                $(".discountText").val($(".percent_cal").val())
                $(".discount_check").attr("checked", "checked")
                $(".discount_panel").show()


            } else {
                $(".syt2").append("<b class='sys'>Genel Toplam:&nbsp;" + says + "₺</b>")
                $(".discount_check").removeAttr("checked")
                $(".discount_panel").hide()
                $(".generalTotalText").val((says).toFixed())

            }

            $(".syt").append("<b class='sys'> Toplam:&nbsp;" + says + "₺</b>")

        }

        $(document).delegate(".discount_check", "click", function () {
            $(".percent_cal").val("")
            var isCecked = $(this).is(":checked")
            if (isCecked) {
                $(".discount_panel").show()
            } else {
                trSy()
                $(".discount_panel").hide()
            }

        })
        $(document).on("change", "#mmtsihtml input,#mmtsihtml select", function () {


            if ($(this).attr("type") != "checkbox") {
                for (const element of $("#mmtsihtml input")) {

                    if ($(element).attr("type") != "checkbox") {
                        var currentValue = $(element).val();
                        $(element).attr("value", currentValue);
                    }

                }
                for (const element of $("#mmtsihtml select")) {
                    var currentValue = $(element).find("option:selected").text()
                    $(element).attr("value", currentValue);
                }
            } else {
                for (const element of $("#mmtsihtml input")) {
                    if ($(element).attr("type") == "checkbox") {
                        var currentValue = $(element).is(":checked");

                        if (currentValue) {
                            $(element).attr("value", "on");
                        } else {
                            $(element).removeAttr("value");
                        }

                    }


                }

            }


        })

        var i = 0;
        $(document).delegate(".arttir", "click", function () {
            i++
            var ID = $(this).attr("data-class")
            htmls = $("#tr" + ID).html();
            var classa = $("#tr" + ID).attr("class");

            var rep = ID.toString()
            var regex = new RegExp(rep, 'g');
            htmls = htmls.replace(regex, ID.toString() + i.toString())

            $("#tr" + ID).after("<tr class='" + classa + "' name='tr" + ID.toString() + i.toString() + "' Id='tr" + ID.toString() + i.toString() + "'>" + htmls.replace(/\arttir/g, "cikar") + "</tr>")
            $(".cikar").text("-")
            return false;
        })
        var i = 0;
        $(document).delegate(".cikar", "click", function () {
            i++
            var ID = $(this).attr("data-class")
            htmls = $("#tr" + ID).remove();
            return false;
        })


        $(".RadioButtonClick input").click(function () {

            $(".RadioButtonClick input").removeClass("clickInput")
            $(this).addClass("clickInput")
            var control = $(this).val()


            if (control == "0") {
                $(".txtKaynak").show();
                $(".txtKaynak").attr("required", "required")
            }
            else {
                $(".txtKaynak").removeAttr("required")
                $(".txtKaynak").hide();
            }

        })
        if (control2 == "0") {
            $(".txtKaynak").show();
            $(".txtKaynak").attr("required", "required")
        }
        else {
            $(".txtKaynak").removeAttr("required")
            $(".txtKaynak").hide();
        }

        if (Itemss == "Telefon") {
            $(".Item2 input").trigger("click")
        } else if (Itemss == "Diğer") {
            $(".Item3 input").trigger("click")
        } else {

            $(".RadioButtonClick input").eq(0).trigger("click")
            $(".txtKaynak").val(Itemss)
            $(".txtKaynak").show();


        }
        setTimeout(() => {
            
            for (const element of $("#mmtsihtml input[type='checkbox']")) {
                if ($(element).is(":checked")) {
                    $(element).val("on")
                }
            }

            for (const element of $("#mmtsihtml select")) {
                var selectedText = $(element).find("option:selected").text()
                if (selectedText) {
                    $(element).attr("value", selectedText)
                }


            }


        }, 2000);


    }
    return {
        ServiceChecked: ServiceChecked,
        ComputeTotal: ComputeTotal,
        ComputeTimes: ComputeTimes,
        DocumentReady: documentReady
    }
}()

export default OfferJs;