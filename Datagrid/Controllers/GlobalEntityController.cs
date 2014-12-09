using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using Datagrid;

namespace Datagrid.Controllers
{
    public class GlobalEntityController : Controller
    {
        private GeniSysEntities db = new GeniSysEntities();

        // GET: GlobalEntity/Edit/5
        public ActionResult Edit(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }

            var guid = new Guid(id);

            GlobalEntity globalEntity = db.GlobalEntity.Single(x => x.GlobalEntityID == guid);
            if (globalEntity == null)
            {
                return HttpNotFound();
            }
            return PartialView(globalEntity);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "GlobalEntityID,FirstNames,Surname,PreferredName,GovID,Passport,CountryID,LUCPreferredLanguage,Gender,DateOfBirth,LUCMaritalStatus,LUCEntityStatus,EmployerName,EmployeeNo,LUCIncomeCategory,SalaryPayDay,UserName,UserPassword,SecretQuestion,SecretAnswer,InsertedOn,InsertedBy,InsertedByName,UpdatedOn,UpdatedBy,UpdatedByName,LastEntityLogin,TrackingNumber,LegacyMemberID,LegacyUserID,LegacyMerchID,FileRef,LUCFicaStatus,IsLockedOut,LoginAttemptCounter,IsStaff,CompanyRegNo,VatRegNo,LUCGovIDStatus,IDVerificationDate,LUCIDVerificationSource,PasswordChangeDate,LastUsedPassword,LUCTitle,LUCEthnicity,IsNetworkLogin")] GlobalEntity globalEntity)
        {
            if (ModelState.IsValid)
            {
                db.Entry(globalEntity).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index", "Home");
            }
            return PartialView(globalEntity);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
