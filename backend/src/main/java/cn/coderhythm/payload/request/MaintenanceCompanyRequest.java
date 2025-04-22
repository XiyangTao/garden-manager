package cn.coderhythm.payload.request;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class MaintenanceCompanyRequest {

    @NotBlank(message = "企业名称不能为空")
    @Size(max = 200, message = "企业名称长度不能超过200个字符")
    private String companyName;

    @Size(max = 50, message = "企业类别长度不能超过50个字符")
    private String companyType;

    @Size(max = 100, message = "企业法人长度不能超过100个字符")
    private String legalPerson;

    @Size(max = 100, message = "联系人长度不能超过100个字符")
    private String contactPerson;

    @Size(max = 20, message = "联系电话长度不能超过20个字符")
    private String contactPhone;

    @Size(max = 500, message = "地址长度不能超过500个字符")
    private String address;

    // 构造函数
    public MaintenanceCompanyRequest() {}

    public MaintenanceCompanyRequest(String companyName, String companyType, String legalPerson,
                             String contactPerson, String contactPhone, String address) {
        this.companyName = companyName;
        this.companyType = companyType;
        this.legalPerson = legalPerson;
        this.contactPerson = contactPerson;
        this.contactPhone = contactPhone;
        this.address = address;
    }

    // Getters and Setters
    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyType() {
        return companyType;
    }

    public void setCompanyType(String companyType) {
        this.companyType = companyType;
    }

    public String getLegalPerson() {
        return legalPerson;
    }

    public void setLegalPerson(String legalPerson) {
        this.legalPerson = legalPerson;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
} 