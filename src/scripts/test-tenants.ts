
import { TenantService } from "../lib/tenants/service";
import { prisma } from "../lib/prisma";

async function main() {
    console.log("--- STARTING TENANT SERVICE TEST ---");

    // 1. CLEANUP (Optional, to ensure clean state)
    const old = await prisma.tenant.findUnique({ where: { slug: "test-tenant-automation" } });
    if (old) {
        console.log("Cleaning up old test tenant...");
        await prisma.tenant.delete({ where: { id: old.id } });
    }

    // 2. CREATE
    console.log("\n1. Testing CREATE...");
    const created = await TenantService.createTenant({
        name: "Test Automation Tenant",
        slug: "test-tenant-automation",
        discordGuildId: "123456789012345678",
        discordClientId: "123456789012345678",
        discordClientSecret: "supersecret",
        discordRoleAdmin: "123456789012345678",
    });
    console.log("Created Tenant:", created.name, created.slug, created.features);

    if (created.slug !== "test-tenant-automation") throw new Error("Slug mismatch");
    if (!created.features.archive) throw new Error("Default features missing");

    // 3. GET / LIST
    console.log("\n2. Testing LIST...");
    const list = await TenantService.listTenants();
    console.log(`Found ${list.length} tenants.`);
    const found = list.find(t => t.id === created.id);
    if (!found) throw new Error("Created tenant not found in list");

    // 4. UPDATE
    console.log("\n3. Testing UPDATE...");
    const updated = await TenantService.updateTenant(created.id, {
        name: "Updated Name",
        features: {
            archive: false,
            punishments: true,
            discordNotify: false
        }
    });
    console.log("Updated Tenant:", updated.name, updated.features);

    if (updated.name !== "Updated Name") throw new Error("Name update failed");
    if (updated.features.archive !== false) throw new Error("Feature update failed");

    // 5. DELETE
    console.log("\n4. Testing DELETE...");
    await TenantService.deleteTenant(created.id);

    const check = await TenantService.getTenantById(created.id);
    if (check) throw new Error("Delete failed, tenant still exists");
    console.log("Tenant deleted successfully.");

    console.log("\n--- TEST COMPLETED SUCCESSFULLY ---");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
